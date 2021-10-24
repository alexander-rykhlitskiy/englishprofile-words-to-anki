import * as fs from "fs";
import { JSDOM } from "jsdom";

import { fetchHtml, closest } from "./utils.js";

const CEFR_LEVELS = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

interface WordDetail {
  word: string,
  definition: string,
  ipa: string,
  examples: string[],
  url: string,
  level: string,
  wordFamilies: WordFamily[]
}

interface WordFamily {
  partOfSpeech: string,
  words: string[],
}

async function fetchWordsHtmlByLevel(cefrLevel: string | undefined) {
  let body = `limit=0`; // no limit
  if (cefrLevel) {
    body = [body, `filter_custom_Level%5B%5D=${CEFR_LEVELS[cefrLevel]}`].join('&');
  }
  const cacheFileNamePrefix = cefrLevel;

  const wordsHtml = await fetchHtml(
    "https://www.englishprofile.org/american-english",
    `_${cacheFileNamePrefix}`,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: body,
      method: "POST",
    }
  );
  const wordsDom = new JSDOM(wordsHtml);
  return wordsDom.window.document;
}

function getWordFamilies(infoBody: ParentNode) {
  const wordsRows = closest(infoBody, '.pos_section').querySelectorAll('.wf_body div');
  return [...wordsRows].map((div) => {
    const spans = [...div.querySelectorAll('span')];
    return {
      partOfSpeech: spans[0].textContent,
      words: spans.slice(1).map(span => span.textContent),
    }
  });
}

function findWordInfoBody(document: Document, word: string, level: string) {
  const node = [...document.querySelectorAll(`.label-${level}`)].find((levelNode) => {
    return closest(levelNode, '.info.sense')?.querySelector('.sense_title').textContent === word;
  })
  return node.parentNode;
}

async function fetchWordDetails(word: string, level: string, wordDetailsUrl: string): Promise<WordDetail> {
  const document = new JSDOM(
    await fetchHtml(wordDetailsUrl, word)
  ).window.document;
  const infoBody = findWordInfoBody(document, word, level);
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
    wordFamilies: getWordFamilies(infoBody),
  };
}

async function fetchWordsDetails(wordsListFilePath: fs.PathOrFileDescriptor, cefrLevel: string | undefined): Promise<WordDetail[]> {
  const words = fs.readFileSync(wordsListFilePath, "utf8").split("\n");
  const document = await fetchWordsHtmlByLevel(cefrLevel);

  const trs = document.querySelectorAll('tbody tr');

  const wordsDetails = [];
  for (const word of words) {
    if (!word) continue;

    console.log(`Processing the word "${word}"`);

    try {
      let level: string, wordDetailsUrl: string;
      // xpath works really slow. //td[contains(text(),'${word}')] - about 50 seconds
      for (const tr of trs) {
        if (tr.children[0].textContent === word) {
          // @ts-ignore: Property 'href' does not exist on type 'Element'.ts(2339)
          wordDetailsUrl = tr.querySelector("td:last-child a").href;
          if (wordDetailsUrl.match(/\d+$/)) { // some urls are invalid and look like 'https://www.englishprofile.org/american-english/words/usdetail/'
            level = tr.querySelector(".label").textContent;
            break;
          }
        }
      }
      if (!level || !wordDetailsUrl) {
        throw new Error(`Level (${level}) or wordDetailsUrl (${wordDetailsUrl}) is blank`);
      }
      const wordDetails = await fetchWordDetails(word, level, wordDetailsUrl);
      wordsDetails.push(wordDetails);
    } catch (error) {
      console.error(`Error processing the word "${word}":`, error);
    }
  }
  return wordsDetails;
}

export { fetchWordsDetails, WordDetail };
