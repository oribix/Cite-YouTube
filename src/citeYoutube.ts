// eslint-disable-next-line camelcase
import {google, youtube_v3 as youtube} from 'googleapis';
import {format, URL, URLSearchParams} from 'url';
import {read, readFile} from 'fs-extra'
// import process from 'process';

/**
 * entry point
 */
function main() {
  const argv = process.argv.splice(2);
  if (argv.length <= 0) {
    console.error('no url provided!');
    return;
  }

  const url = argv[0];

  citeYoutube(url)
      .then(console.log)
      .catch(console.error);
}

/**
 * The youtube citation is in MLA format.
 * This function was created using a guide from easybib.com
 * https://www.easybib.com/guides/citation-guides/mla-format/how-to-cite-video-youtube-mla/
 *
 * @param {string} youtubeUrl youtube URL
 * @return {string} youtube citation
 * @example
 * `“Video Title.” YouTube, uploaded by accountName, Day Mon. YYYY, URL.`
 */
async function citeYoutube(youtubeUrl: string): Promise<string> {
  const {title, account, date, url} = await getVideoData(youtubeUrl);

  const citation =
    `"${title}.", YouTube, uploaded by ${account}, ${date}, ${url}`;

  return citation;
}

/**
 * @param {string} url youtube video URL
 */
async function getVideoData(url: string) {
  const API_KEY = await getAPIKey()
  const auth = google.auth.fromAPIKey(API_KEY);
  const service = google.youtube('v3');
  const results = await service.videos.list({
    id: [getYoutubeID(url)],
    auth: auth,
    part: ['snippet'],
  });

  const videoListResults = results?.data?.items;

  const noVideoError = `no video found: ${url}`;
  if (!videoListResults?.length) throw new Error(noVideoError);

  const {title, channelTitle, publishedAt} =
    videoListResults[0].snippet as youtube.Schema$VideoSnippet;

  return {
    title: title || 'no title',
    account: channelTitle || 'no uploader',
    date: formatYoutubeDate(publishedAt) || 'no date',
    url: sanitizeYoutubeUrl(url),
  };
}

async function getAPIKey() {
  return readFile('GoogleAPIKey', 'utf-8');
}

/**
 *
 * @param {string} date publish date from youtube
 * @return {string} date formatted for MLA
 */
function formatYoutubeDate(date?: string | null): string {
  if (!date) return '';

  const d = new Date(date);
  const dateString = d.toLocaleDateString('default', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const [month, day, year] = dateString.replace(',', '').split(' ');

  return `${day} ${month}. ${year}`;
}

/**
 * @param {string} youtubeUrl youtube url
 * @return {string} youtube url with all unnecessary components removed.
 */
function sanitizeYoutubeUrl(youtubeUrl: string): string {
  const formatConfig = {
    auth: false,
    fragment: false,
    search: false,
  };

  const newParams = (new URLSearchParams());
  newParams.append('v', getYoutubeID(youtubeUrl));

  const url = new URL(youtubeUrl);
  const formattedUrl = new URL(format(url, formatConfig));
  formattedUrl.search = newParams.toString();

  return formattedUrl.toString();
}

/**
 * @param {string} youtubeurl
 * @return {string} youtube ID or "" if none found
 */
function getYoutubeID(youtubeurl: string): string {
  const url = new URL(youtubeurl);
  const params = url.searchParams;
  const idKey = 'v';
  return params.get(idKey) || '';
}

main();
