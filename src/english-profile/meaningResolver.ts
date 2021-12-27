import { WordInfoData, WordMetadata } from "./models";

function sameOrEmpty(value1: string, value2: string) {
  return value1 === '' || value2 === '' || value1.toLowerCase() === value2.toLowerCase();
}

function matchMeaning(
  word: WordMetadata,
  meanings: WordInfoData[],
  includeGuideWord: boolean,
  includeLevel: boolean,
  includePartOfSpeech: boolean,
  allowNotExactMatch?: boolean,
) {
  let expectedWordTitle = `${word.baseWord}`;
  if (word.guideWord && includeGuideWord) {
    expectedWordTitle += ` (${word.guideWord})`;
  }

  let matchedList = meanings
    .filter(x => sameOrEmpty(x.infoTitle, expectedWordTitle))
  if (includeLevel) {
    matchedList = matchedList.filter(x => sameOrEmpty(x.level, word.level))
  }
  if (includePartOfSpeech) {
    matchedList = matchedList.filter(x => sameOrEmpty(x.partOfSpeech, word.partOfSpeech))
  }

  if (matchedList.length > 0) {
    if (matchedList.length === 1 || allowNotExactMatch) {
      return matchedList[0];
    }
  }

  return null;
}

export function resolveMeaning(word: WordMetadata, meanings: WordInfoData[]): WordInfoData {
  const resolveList = [
    () => matchMeaning(word, meanings, true, false, false),
    () => matchMeaning(word, meanings, false, false, false),
    () => matchMeaning(word, meanings, true, true, false),
    () => matchMeaning(word, meanings, false, true, false),
    () => matchMeaning(word, meanings, true, true, true, true),
    () => matchMeaning(word, meanings, false, true, true, true),
  ];
  
  for (const resolve of resolveList) {
    const resolvedValue = resolve();
    if (resolvedValue) {
      return resolvedValue;
    }
  }

  console.warn(`'${word.baseWord}' (level: ${word.level}, guide word: ${word.guideWord}): no exact meaning found on ${word.wordDetailsUrl}`);
  return null;
}
