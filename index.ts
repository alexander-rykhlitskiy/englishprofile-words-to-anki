import * as fs from "fs";
import * as path from "path";
import stringify from "csv-stringify";
import yargs from "yargs";

import { fetchWordsDetails } from "./src/word-details.js";
import { convertWordDetailsToCsvRowItems } from "./src/anki.js";

// https://github.com/yargs/yargs/blob/main/docs/typescript.md
const argv = yargs(process.argv.slice(2)).options({
  'cefrLevel': {
      alias: 'l',
      description: 'CEFR level (A1, A2, B1, B2, C1, C2) used to download the words. The words are found with this level selected on this page https://www.englishprofile.org/american-english.',
      type: 'string',
  },
  'wordsFile': {
      alias: 'w',
      description: 'Path to the file with each word on a new line. The words should be from the EnglishProfile words list page mentioned above.',
      type: 'string',
      demandOption: true
  },
}).parseSync();

const wordsDetails = await fetchWordsDetails(argv.wordsFile, argv.cefrLevel);

const csvRecords = wordsDetails.map((wordDetail) =>
  convertWordDetailsToCsvRowItems(wordDetail)
);

stringify(csvRecords, (err, output) => {
  const filePath =
    path.basename(argv.wordsFile, path.extname(argv.wordsFile)) +
    ".csv";
  fs.writeFileSync(filePath, output);
});
