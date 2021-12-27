# EnglishProfile words to Anki

Script to download [englishprofile.org](https://www.englishprofile.org/wordlists/evp) words grouped by level. It generates CSV for importing from Anki.

## Usage

```bash
npm install

npm start -- --help
npm start -- --filterLevel A1 --filterTopic technology --outputFile ./out/result
```

## Debugging

Debugging is configured with Visual Studio Code.

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
