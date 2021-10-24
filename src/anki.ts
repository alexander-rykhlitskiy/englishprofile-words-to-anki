import { WordDetail } from "./word-details";

function getATag(wordDetails: WordDetail) {
  return `<a href='${wordDetails.url}'>${wordDetails.word}</a>`;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function convertWordDetailsToCsvRowItems(wordDetails: WordDetail): string[] {
  const front = wordDetails.definition;
  let back: string;
  const tags = wordDetails.level;

  let linkAdded = false;
  const regex = new RegExp(`(\\W|^)(${escapeRegExp(wordDetails.word)})(\\W|$)`, "i");
  const examples = wordDetails.examples.map((example, index) => {
    let htmlExample = example;
    if (example.match(regex)) {
      linkAdded = true;
      htmlExample = example.replace(
        regex,
        `$1<b>${getATag(wordDetails)}</b>$3`
      );
    }
    if (index > 0) {
      htmlExample = `[${htmlExample}]`;
    }
    return htmlExample;
  });
  back = `${examples.join("<br>")}<br><br>[${wordDetails.ipa}]<br><br>`;

  if (wordDetails.wordFamilies.length) {
    const family = wordDetails.wordFamilies
      .map((family) => `<b>${family.partOfSpeech}</b> ${family.words.join("")}`)
      .join("<br>");
    back = `${back}[${family}]<br><br>`;
  }

  if (!linkAdded) {
    back = `${back}[<b>${getATag(wordDetails)}</b>]<br><br>`;
  }

  return [front, back, tags];
}

export { convertWordDetailsToCsvRowItems };
