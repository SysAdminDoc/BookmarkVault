import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
const exists = relativePath => fs.existsSync(path.join(repositoryRoot, relativePath));

function pngSize(relativePath) {
  const buffer = fs.readFileSync(path.join(repositoryRoot, relativePath));
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG', `${relativePath} must be a PNG file`);
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

const readme = read('README.md');
const changelog = read('CHANGELOG.md');
const index = read('index.html');
const heroSource = read('concepts/marketing/2026-09-13/source/hero.svg');
const publicWriting = [
  readme,
  changelog,
  read('concepts/marketing/2026-09-13/selection.md'),
  read('concepts/marketing/2026-09-13/audit-report.md')
].join('\n');
const proseWriting = publicWriting
  .split(/\r?\n/)
  .filter(line => !/^\|[\s:|-]+\|$/.test(line))
  .join('\n');
const forbiddenAuthorshipNames = [
  'Cl' + 'aude',
  'Co' + 'dex',
  'Co' + 'pilot',
  'Open' + 'AI'
];
const forbiddenAuthorshipPattern = new RegExp(`\\b(?:${forbiddenAuthorshipNames.join('|')})\\b`, 'i');

const heroPath = 'assets/marketing/bookmarkvault-hero.png';
assert.equal(readme.split(/\r?\n/, 1)[0], `![BookmarkVault helps you search and organize a local web directory.](${heroPath})`);
assert.equal((readme.match(/assets\/marketing\/bookmarkvault-hero\.png/g) || []).length, 1, 'README must contain one hero');
assert.match(readme, /version-0\.0\.3/);
assert.match(changelog, /## 0\.0\.3 \(2026-09-13\)/);
assert.match(index, /<title>BookmarkVault v0\.0\.3<\/title>/);
assert.match(index, /name="description" content="Search a 5,000-site starter directory/);
assert.match(index, /name="theme-color" content="#0a0a0f"/);
assert.match(index, /Search 5,000 starter sites/);
assert.match(index, /Start with 5,000 sites\. Load the included 50,000-site pack/);
assert.doesNotMatch(index, /Browse and bookmark websites from 959K\+ categorized sites/);

for (const label of ['Discover', 'Bookmarks', 'Import', 'Export']) {
  assert.match(index, new RegExp(`class="mobile-nav-btn[^>]*>${label}<`));
}

for (const relativePath of [
  heroPath,
  'assets/brand/bookmarkvault-logo.svg',
  'assets/brand/bookmarkvault-logo-512.png',
  'assets/brand/bookmarkvault-logo-64.png',
  'docs/screenshots/v0.0.3/discover.png',
  'docs/screenshots/v0.0.3/search.png',
  'docs/screenshots/v0.0.3/bookmarks.png',
  'docs/screenshots/v0.0.3/mobile.png'
]) {
  assert.ok(exists(relativePath), `${relativePath} must exist`);
}

assert.deepEqual(pngSize(heroPath), [1600, 900]);
assert.deepEqual(pngSize('docs/screenshots/v0.0.3/discover.png'), [1440, 900]);
assert.deepEqual(pngSize('docs/screenshots/v0.0.3/search.png'), [1440, 900]);
assert.deepEqual(pngSize('docs/screenshots/v0.0.3/bookmarks.png'), [1440, 900]);
assert.deepEqual(pngSize('docs/screenshots/v0.0.3/mobile.png'), [390, 844]);

assert.doesNotMatch(heroSource, />\s*v\d+\.\d+\.\d+\s*</i, 'Hero must not display a version number');
assert.doesNotMatch(publicWriting, /[—–]/, 'Public writing must not use em or en dashes');
assert.doesNotMatch(proseWriting, / - /, 'Public writing must not use a spaced hyphen as a dash');
assert.doesNotMatch(publicWriting, forbiddenAuthorshipPattern, 'Public files must not name automated authorship tools');

console.log('BookmarkVault marketing checks passed.');
