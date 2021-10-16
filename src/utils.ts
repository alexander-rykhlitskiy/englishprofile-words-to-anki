import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";

// https://stackoverflow.com/questions/15329167/closest-ancestor-matching-selector-using-native-dom
// get nearest parent element matching selector
function closest(el: ParentNode, selector: string): ParentNode {
  // @ts-ignore: Property 'matches' does not exist on type 'ParentNode'.ts(2339)
  var matchesSelector = el.matches;

  while (el) {
    if (matchesSelector.call(el, selector)) {
      break;
    }
    el = el.parentElement;
  }
  return el;
}

async function fetchHtml(url: string, cacheFileNamePrefix = '', fetchOptions = {}): Promise<string> {
  const cacheDirPath = "cache";
  const cachePath = path.join(cacheDirPath, `${cacheFileNamePrefix}_${url.replace(/\W/g, "_")}.html`);
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, "utf8");
  } else {
    fs.mkdirSync(cacheDirPath, { recursive: true });
    const html = await (await fetch(url, fetchOptions)).text();
    await new Promise((r) => setTimeout(r, 2000));
    fs.writeFileSync(cachePath, html);
    return html;
  }
}

export { closest, fetchHtml };
