import fs from "fs";
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

async function fetchWordsHtmlByLevel(cefrLevel) {
  const wordsHtml = await fetchHtml(
    "https://www.englishprofile.org/american-english",
    `_${cefrLevel}`,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: `filter_custom_Level%5B%5D=${CEFR_LEVELS[cefrLevel]}&limit=0`, // no limit
      method: "POST",
    }
  );
  const wordsDom = new JSDOM(wordsHtml);
  return wordsDom.window.document;
}

async function fetchWordDetails(word, wordTr) {
  const level = wordTr.querySelector(".label").textContent;
  const wordDetailsUrl = wordTr.querySelector("td:last-child a").href;
  const document = new JSDOM(
    await fetchHtml(wordDetailsUrl, word)
  ).window.document;
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

async function fetchWordsDetails(cefrLevel, wordsListFilePath) {
  const words = fs.readFileSync(wordsListFilePath, "utf8").split("\n");
  const document = await fetchWordsHtmlByLevel(cefrLevel);

  const wordTds = [...document.querySelectorAll("td:first-child")];

  const wordsDetails = [];
  for (const word of words) {
    if (!word) continue;

    console.log(`Processing the word "${word}"`);

    try {
      // xpath works really slow. //td[contains(text(),'${word}')] - about 50 seconds
      const wordTr = wordTds.find((td) => td.textContent === word).parentNode;
      const wordDetails = await fetchWordDetails(word, wordTr);
      wordsDetails.push(wordDetails);
    } catch (error) {
      console.error(`Error processing the word "${word}":`, error);
    }
  }
  return wordsDetails;
}

export default fetchWordsDetails;
