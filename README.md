# EnglishProfile words to Anki

https://www.englishprofile.org/american-english

Script to download EnglishProfile words grouped by level. It generates CSV for importing from Anki.

## Usage
```bash
npm i

npm run generate-csv -- --help

npx tsc --watch # or npx tsc
node built/index.js --wordsFile /path/to/file/with/words.txt

node built/index.js --cefrLevel B2 --wordsFile /path/to/file/with/words.txt
# or
npm run generate-csv -- --cefrLevel B2 --wordsFile /path/to/file/with/words.txt
npm run-script generate-csv -- -w words_lists/idioms.txt
```

Result CSV file is located in the root folder of this repository. Its name is the same as the name of the file with words, but with `csv` extension. So for the example above it's going to be `words.csv`.

## ToDo

- [x] add word family (words of the same root)
- [x] do not speak initial form in the end
- [x] make initial form in the end bold
- [x] new line after first example
- [x] fetch idioms and phrases
- [ ] fetch exact word by Guideword
- [ ] https://www.englishprofile.org/american-english/words/usdetail/798
- [ ] These are words often used in combination with turmoil. https://dictionary.cambridge.org/dictionary/english/turmoil
- [ ] show number of verbs, nouns on front side
- [ ] fetch definitions from ALL levels
- [ ] make forms in the sentense bold and linked
- [ ] use British words too

    lap
    exclamation mark
    inverted commas
    enquire
    aubergine

- [ ] add part of speech
