import yargs from 'yargs';

import { CEFR_LEVELS, TOPICS } from './models';
import { fileExistsOrNotSet, loadWordListFileIfSet } from './fileUtils';
import { fetchEnglishProfile } from './english-profile';
import { createAnkiCsvImportFile } from './anki';

async function execute() {
  const argv = await yargs(process.argv)
    .option('filterLevel', {
      alias: 'l',
      description: 'Filter level',
      array: true,
      type: 'string',
      choices: Object.keys(CEFR_LEVELS),
    })
    .option('filterTopic', {
      alias: 't',
      description: 'Filter topic',
      type: 'string',
      choices: Object.keys(TOPICS),
    })
    .option('filterWordList', {
      alias: 'w',
      description: 'Path to word list file. Each word is on a new line',
      type: 'string',
    })
    .option('outputFile', {
      alias: 'o',
      description: 'Output Filename',
      type: 'string',
      default: 'ankiCollection',
    })
    .check((argv) => fileExistsOrNotSet(argv.filterWordList))
    .parseAsync();

  const wordsFilter: string[] = await loadWordListFileIfSet(argv.filterWordList);

  const wordsDetails = await fetchEnglishProfile(argv.filterLevel, argv.filterTopic, wordsFilter);

  await createAnkiCsvImportFile(wordsDetails, argv.outputFile);
}

execute()
  .then();
