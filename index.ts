import * as fs from "fs";
import * as path from "path";
import stringify from "csv-stringify";

import { fetchWordsDetails } from "./src/word-details.js";
import { convertWordDetailsToCsvRowItems } from "./src/anki.js";

const ARGV = process.argv.slice(2);

const CEFR_LEVEL = ARGV[0];
const WORDS_LIST_FILE_PATH = ARGV[1];

const wordsDetails = await fetchWordsDetails(CEFR_LEVEL, WORDS_LIST_FILE_PATH);

const csvRecords = wordsDetails.map((wordDetail) =>
  convertWordDetailsToCsvRowItems(wordDetail)
);

stringify(csvRecords, (err, output) => {
  const filePath =
    path.basename(WORDS_LIST_FILE_PATH, path.extname(WORDS_LIST_FILE_PATH)) +
    ".csv";
  fs.writeFileSync(filePath, output);
});
