# EnglishProfile words to Anki

https://www.englishprofile.org/american-english

Script to download EnglishProfile words grouped by level. It generates CSV for importing from Anki.

## Usage
```bash
npm i
node index.js B2 /path/to/file/with/words.txt
```

`B2` - CEFR level (A1, A2, B1, B2, C1, C2). The words are found with this level selected on this page https://www.englishprofile.org/american-english.

`/path/to/file/with/words.txt` - path to the file with each word on a new line. The words should be from the page mentioned above.

Result CSV file is located in the root folder of this repository. Its name is the same as the name of the file with words, but with `csv` extension. So for the example above it's going to be `words.csv`.

## ToDo

- [ ] use British words too

    lap
    exclamation mark
    inverted commas
    enquire
    aubergine

- [ ] add part of speech