import fetch from "node-fetch";
import { JSDOM } from "jsdom";
// const { JSDOM } = jsdom;
import fs from "fs";
import path from "path";
import stringify from "csv-stringify";

// https://stackoverflow.com/questions/15329167/closest-ancestor-matching-selector-using-native-dom
// get nearest parent element matching selector
function closest(el, selector) {
  var matchesSelector =
    el.matches ||
    el.webkitMatchesSelector ||
    el.mozMatchesSelector ||
    el.msMatchesSelector;

  while (el) {
    if (matchesSelector.call(el, selector)) {
      break;
    }
    el = el.parentElement;
  }
  return el;
}

async function fetchHtml(url, cacheFileName) {
  const cacheDirPath = "cache";
  const cachePath = path.join(cacheDirPath, cacheFileName);
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, "utf8");
  } else {
    fs.mkdirSync(cacheDirPath, { recursive: true });
    const html = await (await fetch(url)).text();
    await new Promise((r) => setTimeout(r, 2000));
    fs.writeFileSync(cachePath, html);
    return html;
  }
}

async function fetchWordDetails(word, wordTr) {
  const level = wordTr.querySelector(".label").textContent;
  const wordDetailsUrl = wordTr.querySelector("td:last-child a").href;
  const document = new JSDOM(await fetchHtml(wordDetailsUrl, `${word}.html`))
    .window.document;
  const infoBody = document.querySelector(`.label-${level}`).parentNode;
  return {
    word: word,
    definition: infoBody.querySelector(".definition").textContent,
    ipa: closest(infoBody, ".pos_section").querySelector(".written")
      .textContent,
    examples: [...infoBody.querySelectorAll(".example p")].map(
      (p) => p.textContent
    ),
    url: wordDetailsUrl,
    level: level,
  };
}

async function generateWordsDetails(
  wordsListFilePath,
  englishprofileHTMLFilePath
) {
  const words = fs.readFileSync(wordsListFilePath, "utf8").split("\n");
  const wordsHtml = fs.readFileSync(englishprofileHTMLFilePath, "utf8");

  const wordsDom = new JSDOM(wordsHtml);
  const document = wordsDom.window.document;
  const wordTds = [...document.querySelectorAll("td:first-child")];

  const wordsDetails = [];
  for (const word of words.slice(0, 2)) {
    // xpath works really slow. //td[contains(text(),'${word}')] - about 50 seconds
    const wordTr = wordTds.find((td) => td.textContent === word).parentNode;
    const wordDetails = await fetchWordDetails(word, wordTr);
    wordsDetails.push(wordDetails);

    console.log(`Downloaded word "${word}" (${JSON.stringify(wordDetails)})`);
  }
  return wordsDetails;
}

function getATag(wordDetails) {
  return `<a href='${wordDetails.url}'>${wordDetails.word}</a>`;
}

function convertDetailsToCsvRowItems(wordDetails) {
  const front = wordDetails.word;
  let back;
  const tags = wordDetails.level;

  let linkAdded = false;
  const regex = new RegExp(`(\\W|^)(${wordDetails.word})(\\W|$)`, "i");
  const examples = wordDetails.examples.map((example, index) => {
    let htmlExample = example;
    if (example.match(regex)) {
      linkAdded = true;
      htmlExample = example.replace(
        regex,
        `$1<b>${getATag(wordDetails)}</b>$3`
      );
      if (index > 0) {
        htmlExample = `[${htmlExample}]`;
      }
    }
    return htmlExample;
  });
  back = `${examples.join("<br>")}<br><br>[${wordDetails.ipa}]<br>`;

  if (!linkAdded) {
    back = `${back}${getATag(wordDetails)}<br>`;
  }

  return [front, back, tags];
}

const ARGV = process.argv.slice(2);

const WORDS_LIST_FILE_PATH =
  ARGV[0] || "../../../hobby/english/englishprofile/words/b2.txt";
const ENGLISHPROFILE_HTML_FILE_PATH =
  ARGV[1] ||
  "../../../hobby/english/englishprofile/words/B2 - English Profile - EVP Online.html";

const wordsDetailsCachePath = path.join("cache", "_words_details.json");

let wordsDetails;
if (fs.existsSync(wordsDetailsCachePath)) {
  wordsDetails = JSON.parse(fs.readFileSync(wordsDetailsCachePath));
} else {
  wordsDetails = await generateWordsDetails(
    WORDS_LIST_FILE_PATH,
    ENGLISHPROFILE_HTML_FILE_PATH
  );
  fs.writeFileSync(wordsDetailsCachePath, JSON.stringify(wordsDetails));
}

const csvRecords = wordsDetails.map((wordDetail) =>
  convertDetailsToCsvRowItems(wordDetail)
);

stringify(csvRecords, (err, output) => {
  const filePath =
    path.basename(WORDS_LIST_FILE_PATH, path.extname(WORDS_LIST_FILE_PATH)) +
    ".csv";
  fs.writeFileSync(filePath, output);
});
