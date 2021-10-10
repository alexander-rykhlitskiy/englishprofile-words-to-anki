import fs from "fs";
import { JSDOM } from "jsdom";

import { fetchHtml, closest } from "./utils.js";

async function fetchWordDetails(word, wordTr) {
  const level = wordTr.querySelector(".label").textContent;
  const wordDetailsUrl = wordTr.querySelector("td:last-child a").href;
  const cacheFileName = `${word}_${wordDetailsUrl.replace(/\W/g, "_")}.html`;
  const document = new JSDOM(await fetchHtml(wordDetailsUrl, cacheFileName))
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
