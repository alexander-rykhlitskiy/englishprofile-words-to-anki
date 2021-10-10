import fetch from "node-fetch";
import fs from "fs";
import path from "path";

// https://stackoverflow.com/questions/15329167/closest-ancestor-matching-selector-using-native-dom
// get nearest parent element matching selector
function closest(el, selector) {
  var matchesSelector =
    el.matches ||
    el.webkitMatchesSelector ||
    el.mozMatchesSelector ||
    el.msMatchesSelector;

  while (el) {
    if (matchesSelector.call(el, selector)) {
      break;
    }
    el = el.parentElement;
  }
  return el;
}

async function fetchHtml(url, cacheFileNamePrefix = '', fetchOptions = {}) {
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
