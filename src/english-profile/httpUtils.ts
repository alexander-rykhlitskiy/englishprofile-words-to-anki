import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosRequestConfig } from 'axios';

const FETCH_DELAY = 1000;

function pathify(string: string) {
  return string.replace(/\W/g, '_');
}

async function fetchHtml(url: string, fetchOptions:AxiosRequestConfig = {}): Promise<string> {
  console.debug(` fetching URL: ${url}`);
  const response = await axios.request({
    url,
    ...fetchOptions,
  });
  const html = await response.data;
  return html;
}

export async function fetchHtmlCached(url: string, fetchOptions: AxiosRequestConfig = {}): Promise<string> {
  const cacheDirPath = 'cache';
  const cacheSuffix = fetchOptions.data ? `_${pathify(fetchOptions.data.toString())}` : ``;
  const cachePath = path.join(cacheDirPath, `_${pathify(url)}${cacheSuffix}.html`);
  if (fs.existsSync(cachePath)) {
    console.debug(` page extracted from cache: ${url}`);
    return fs.readFileSync(cachePath, 'utf8');
  } else {
    fs.mkdirSync(cacheDirPath, { recursive: true });
    const html = await fetchHtml(url, fetchOptions);
    await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY));
    fs.writeFileSync(cachePath, html);
    console.debug(` page cached: ${url}`);
    return html;
  }
}
