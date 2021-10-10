import fs from "fs";
import path from "path";
import stringify from "csv-stringify";

import fetchWordsDetails from "./src/word-details.js";
import { convertWordDetailsToCsvRowItems } from "./src/anki.js";

const ARGV = process.argv.slice(2);

const WORDS_LIST_FILE_PATH = ARGV[0];
const ENGLISHPROFILE_HTML_FILE_PATH = ARGV[1];

const wordsDetailsCachePath = path.join("cache", "_words_details.json");

let wordsDetails;
if (fs.existsSync(wordsDetailsCachePath)) {
  wordsDetails = JSON.parse(fs.readFileSync(wordsDetailsCachePath));
} else {
  wordsDetails = await fetchWordsDetails(
    WORDS_LIST_FILE_PATH,
    ENGLISHPROFILE_HTML_FILE_PATH
  );
  fs.writeFileSync(wordsDetailsCachePath, JSON.stringify(wordsDetails));
}

const csvRecords = wordsDetails.map((wordDetail) =>
  convertWordDetailsToCsvRowItems(wordDetail)
);

stringify(csvRecords, (err, output) => {
  const filePath =
    path.basename(WORDS_LIST_FILE_PATH, path.extname(WORDS_LIST_FILE_PATH)) +
    ".csv";
  fs.writeFileSync(filePath, output);
});
