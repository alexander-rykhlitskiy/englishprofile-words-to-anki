import * as fs from 'fs';

export function fileExistsOrNotSet(filePath: fs.PathLike) {
  return !filePath || fs.existsSync(filePath);
}

export async function loadWordListFileIfSet(filePath: fs.PathLike): Promise<string[]> {
  if (!filePath) 
    return null;

  if (!fileExistsOrNotSet(filePath)) {
    throw `${filePath} is not found`;
  }

  const words = fs.readFileSync(filePath, "utf8")
    .split("\n")
    .map(x => x.trim());

  return words;
}
