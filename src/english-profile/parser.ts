import { JSDOM } from 'jsdom';

import { WordInfoData, WordMetadata } from './models';

function extractTextContent(node) {
  return node?.textContent?.trim() ?? '';
}

export function parseListHtml(html: string): WordMetadata[] {
  const wordsDom = new JSDOM(html);
  const document = wordsDom.window.document;

  let result = [];
  const trsNodes = document.querySelectorAll('tbody tr');
  for (const trNode of trsNodes) {
    const baseWord = extractTextContent(trNode.querySelector('td:nth-child(1)'));
    const guideWord = extractTextContent(trNode.querySelector('td:nth-child(2)'));
    const level = extractTextContent(trNode.querySelector('td:nth-child(3) .label'));
    const partOfSpeech = extractTextContent(trNode.querySelector('td:nth-child(4)'));
    const topic = extractTextContent(trNode.querySelector('td:nth-child(5)'));
    const wordDetailsUrl = trNode.querySelector('td:last-child a')["href"];
    
    if (!wordDetailsUrl) {
      throw new Error(`wordDetailsUrl (${wordDetailsUrl}) is blank`);
    }

    if (!wordDetailsUrl.match(/\d+$/)) {
      // some urls are invalid and look like 'https://www.englishprofile.org/american-english/words/usdetail/'
      console.warn(`'${baseWord}': invalid URL ${wordDetailsUrl}`);
      continue;
    }

    result.push({
      baseWord,
      guideWord,
      level,
      partOfSpeech,
      topic,
      wordDetailsUrl,
    });
  }

  return result;
}

function parseWordInfo(word: WordMetadata, infoNode: ParentNode, baseInfoNode: ParentNode): WordInfoData {
  try {

    const wordFamilyNodes = baseInfoNode.querySelectorAll('.wf_pos_block');
    const dictionaryExampleNodes = infoNode.querySelectorAll('.example .blockquote');
  
    const wordFamilies = Array.from(wordFamilyNodes).map((div) => {
      return {
        partOfSpeech: extractTextContent(div.querySelector('.wf_pos')),
        words: Array.from(div.querySelectorAll('.wf_word'))
          .map(c => extractTextContent(c)),
      };
    });

    const learnerNode = infoNode.querySelector('.learner');
    const learnerExample = learnerNode ? {
      example: extractTextContent(learnerNode.querySelector('.learnerexamp')),
      cite: extractTextContent(learnerNode.querySelector('.cite')),
    } : null;

    return {
      baseWord: word.baseWord,
      wordDetailsUrl: word.wordDetailsUrl,
      headword: extractTextContent(baseInfoNode.querySelector('.headword')),
      partOfSpeech: extractTextContent(baseInfoNode.querySelector('.pos')),
      transcription: extractTextContent(baseInfoNode.querySelector('.written')),
      wordFamilies,
      infoTitle: extractTextContent(infoNode.querySelector('.sense_title')),
      level: extractTextContent(infoNode.querySelector('.label')),
      grammar: extractTextContent(infoNode.querySelector('.grammar')),
      definition: extractTextContent(infoNode.querySelector('.definition')),
      dictionaryExamples: Array.from(dictionaryExampleNodes).map(p => extractTextContent(p)),
      learnerExample: learnerExample,
    };
	}
  catch (error) {
		console.error(`Error caught for ${word.wordDetailsUrl}: ${error.message}\n${JSON.stringify(word)}`);
		throw(error);
	}
}

function sameOrEmpty(value1: string, value2: string) {
  return value1 === '' || value2 === '' || value1 === value2;
}

export async function parseWordHtml(html: string, word: WordMetadata): Promise<WordInfoData> {
  const wordsDom = new JSDOM(html);
  const document = wordsDom.window.document;

  let expectedWordTitle = `${word.baseWord}`;
  if (word.guideWord){
    expectedWordTitle += ` (${word.guideWord})`;
  }

  const resolvedWordDetailsList: WordInfoData[] = [];
  const baseInfoNodes = document.querySelectorAll('.pos_section');
  for (const baseInfoNode of baseInfoNodes) {
    const infoNodes = baseInfoNode.querySelectorAll('.info.sense');
    for (const infoNode of infoNodes) {
      const resolvedWordDetails = parseWordInfo(word, infoNode, baseInfoNode);
      if (resolvedWordDetails.infoTitle == expectedWordTitle) {
        return resolvedWordDetails;
      }
      resolvedWordDetailsList.push(resolvedWordDetails);
    }
  }
  console.info(`'${word.baseWord}': no exact meaning found for '${expectedWordTitle}' on ${word.wordDetailsUrl}, trying to fallback`);
  
  expectedWordTitle = `${word.baseWord}`;
  const fallbackMatchedList = resolvedWordDetailsList
    .filter(x => sameOrEmpty(x.infoTitle, expectedWordTitle)
      && sameOrEmpty(x.level, word.level)
      && sameOrEmpty(x.partOfSpeech, word.partOfSpeech));
  if (fallbackMatchedList.length === 1) {
    return fallbackMatchedList[0];
  }

  console.warn(`'${word.baseWord}': no exact (${fallbackMatchedList.length}) fallback meaning found for '${expectedWordTitle}' on ${word.wordDetailsUrl}`);
  return null;
}
