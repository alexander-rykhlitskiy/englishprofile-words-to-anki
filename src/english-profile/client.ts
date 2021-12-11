import { CEFR_LEVELS, TOPICS } from '../models';
import { fetchHtmlCached } from './httpUtils';

export async function fetchWordsHtml(useAmerican: boolean, levelFilter?: string[], topicFilter?: string) {
  let formData = new URLSearchParams();
  formData.append('limit', '0');
  if (levelFilter) {
    levelFilter.forEach(levelValue => {
      formData.append('filter_custom_Level[]', `${CEFR_LEVELS[levelValue]}`);
    });
  }
  if (topicFilter) {
    formData.append('filter_custom_Topic', `${TOPICS[topicFilter]}`);
  }

  const url = useAmerican
    ? 'https://www.englishprofile.org/american-english'
    : 'https://www.englishprofile.org/wordlists/evp';
  let body = formData.toString();
  const html = await fetchHtmlCached(
    url,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: body,
    }
  );
  return html;
}

export async function fetchWordDetails(detailsUrl: string) {
  const html = await fetchHtmlCached(
    detailsUrl,
    {
      method: 'GET',
    }
  );
  return html;
}