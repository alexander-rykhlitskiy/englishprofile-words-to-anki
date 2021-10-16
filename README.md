# EnglishProfile words to Anki

https://www.englishprofile.org/american-english

Script to download EnglishProfile words grouped by level. It generates CSV for importing from Anki.

## Usage
```bash
npm i
npx tsc --watch # or npx tsc
node built/index.js B2 /path/to/file/with/words.txt
```

`B2` - CEFR level (A1, A2, B1, B2, C1, C2). The words are found with this level selected on this page https://www.englishprofile.org/american-english.

`/path/to/file/with/words.txt` - path to the file with each word on a new line. The words should be from the page mentioned above.

Result CSV file is located in the root folder of this repository. Its name is the same as the name of the file with words, but with `csv` extension. So for the example above it's going to be `words.csv`.

## ToDo

- [ ] make forms in the sentense bold and liked
- [ ] make initial form in the end bold
- [ ] use British words too

    lap
    exclamation mark
    inverted commas
    enquire
    aubergine

- [ ] add part of speech
- [ ] fetch definitions from lower and the same levels
- [ ] add word family (words of the same root)
- [ ] do not speak initial form in the end
