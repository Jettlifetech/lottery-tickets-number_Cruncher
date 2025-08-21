import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { parseGames } from '../scraper.js';

test('parseGames extracts only active numeric-coded games', () => {
  const html = fs.readFileSync('./sample.html', 'utf8');
  const games = parseGames(html);
  assert.strictEqual(games.length, 2);
  assert.deepStrictEqual(games[0].code, '123');
  assert.deepStrictEqual(games[1].code, '125');
});
