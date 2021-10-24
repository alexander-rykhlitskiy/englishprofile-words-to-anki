import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";

// https://stackoverflow.com/questions/15329167/closest-ancestor-matching-selector-using-native-dom
// get nearest parent element matching selector
function closest(element: ParentNode, selector: string): ParentNode {
  // @ts-ignore: Property 'matches' does not exist on type 'ParentNode'.ts(2339)
  var matchesSelector = element.matches;

  while (element) {
    if (matchesSelector.call(element, selector)) {
      break;
    }
    element = element.parentElement;
  }
  return element;
}

function pathify(string: string) {
  return string.replace(/\W/g, "_");
}

async function fetchHtml(url: string, cacheFileNamePrefix = '', fetchOptions = {}): Promise<string> {
  const cacheDirPath = "cache";
  const cachePath = path.join(cacheDirPath, `${pathify(cacheFileNamePrefix)}_${pathify(url)}.html`);
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, "utf8");
  } else {
    fs.mkdirSync(cacheDirPath, { recursive: true });
    console.log(`Fetching URL: ${url}`);
    const html = await (await fetch(url, fetchOptions)).text();
    await new Promise((r) => setTimeout(r, 2000));
    fs.writeFileSync(cachePath, html);
    return html;
  }
}

export { closest, fetchHtml };
