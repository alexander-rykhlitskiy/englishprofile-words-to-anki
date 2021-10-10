import { JSDOM } from "jsdom";

import { fetchHtml, closest } from "./utils.js";

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

async function fetchWordsDetails(
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

export default fetchWordsDetails;
