import fs from 'node:fs';
import https from 'node:https';

const SOURCE_URL = 'https://www.kslottery.com/eligiblegameslist/';

export async function fetchHtml(url = SOURCE_URL) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status ${res.statusCode}`));
        res.resume();
        return;
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

export function parseGames(html) {
  const items = [];
  const liRegex = /<li([^>]*)>(.*?)<\/li>/gs;
  let match;
  while ((match = liRegex.exec(html)) !== null) {
    const attrs = match[1];
    const body = match[2];
    const hrefMatch = body.match(/href="\/(\d{3}-[^\"]*)"/);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];
    if (href.includes('*')) continue;
    const code = href.split('-')[0];
    const nameMatch = body.match(/>([^<]+)<\/a>/);
    const name = nameMatch ? nameMatch[1].trim() : 'Unknown';
    const status = attrs.match(/data-status="([^\"]+)"/)?.[1] || '';
    if (/sold out|ended/i.test(status)) continue;
    const price = Number(attrs.match(/data-price="(\d+)"/)?.[1] || 0);
    const type = attrs.match(/data-type="([^\"]+)"/)?.[1] || '';
    const prizeCount = Number(attrs.match(/data-prize-count="(\d+)"/)?.[1] || 0);
    const unclaimed = Number(attrs.match(/data-unclaimed="(\d+)"/)?.[1] || 0);
    const launchDate = attrs.match(/data-launch="([^\"]+)"/)?.[1] || '';
    items.push({ code, name, price, type, prizeCount, unclaimed, launchDate });
  }
  return items;
}

export async function generateGames() {
  let html;
  try {
    html = await fetchHtml();
  } catch (err) {
    fs.appendFileSync('errors.log', `[${new Date().toISOString()}] ${err.message}\n`);
    html = fs.readFileSync('sample.html', 'utf8');
  }
  const games = parseGames(html);
  fs.writeFileSync('games.json', JSON.stringify(games, null, 2));
  return games;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateGames();
}
