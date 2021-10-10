function getATag(wordDetails) {
  return `<a href='${wordDetails.url}'>${wordDetails.word}</a>`;
}

function convertWordDetailsToCsvRowItems(wordDetails) {
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

export { convertWordDetailsToCsvRowItems };
