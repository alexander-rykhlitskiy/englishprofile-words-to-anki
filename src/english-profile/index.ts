import { fetchWordsHtml, fetchWordDetails } from './client';
import { WordInfoData } from './models';
import { parseListHtml, parseWordHtml } from './parser';

export * from './models';

export async function fetchEnglishProfile(
    useAmerican: boolean,
    levelsFilter?: string[],
    topicFilter?: string,
    wordsFilter?: string[])
    : Promise<WordInfoData[]> {
  console.log(`Processing the word list`);
  const listHtml = await fetchWordsHtml(useAmerican, levelsFilter, topicFilter);
  const wordList = parseListHtml(listHtml);
  console.log(`Total word count: ${wordList.length})`);

  let result = [];
  for (const word of wordList) {
    if (wordsFilter && !wordsFilter.includes(word.baseWord))
      continue;

    console.log(`Processing the word '${word.baseWord}' (level: ${word.level}, guide word: ${word.guideWord})`);
    const wordHtml = await fetchWordDetails(word.wordDetailsUrl);
    const wordDetails = await parseWordHtml(wordHtml, word);
    result.push(wordDetails);
  }

  return result
    .filter(w => w);
}
