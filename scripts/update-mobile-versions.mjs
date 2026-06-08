#!/usr/bin/env node
/**
 * Update Chef2Home native semver + store build numbers.
 * Default: infer patch/minor/major from commits since the last version bump.
 *
 * Usage:
 *   node scripts/update-mobile-versions.mjs           # auto-detect
 *   node scripts/update-mobile-versions.mjs --dry-run # preview only
 *   node scripts/update-mobile-versions.mjs patch     # manual override
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const APP_JSON = path.join(ROOT, 'app.json');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const PACKAGE_LOCK = path.join(ROOT, 'package-lock.json');

const VALID_BUMPS = new Set(['major', 'minor', 'patch', 'build']);
const BUMP_RANK = { build: 0, patch: 1, minor: 2, major: 3 };

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function git(args) {
  try {
    return execSync(`git ${args}`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return '';
  }
}

function readVersionAtCommit(commit) {
  try {
    const raw = execSync(`git show ${commit}:app.json`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const app = JSON.parse(raw);
    return app.expo?.version ?? null;
  } catch {
    return null;
  }
}

function findLastVersionBumpCommit() {
  const commits = git('log --format=%H -- app.json').split('\n').filter(Boolean);
  if (commits.length === 0) return null;
  if (commits.length === 1) return commits[0];

  for (let i = 0; i < commits.length - 1; i += 1) {
    const newer = commits[i];
    const older = commits[i + 1];
    const vNewer = readVersionAtCommit(newer);
    const vOlder = readVersionAtCommit(older);
    if (vNewer && vOlder && vNewer !== vOlder) {
      return newer;
    }
  }

  return commits[commits.length - 1];
}

function commitsSinceVersionBump(anchorCommit) {
  if (!anchorCommit) {
    return git('log --format=%H%x1f%s%x1f%b%x1e')
      .split('\x1e')
      .filter(Boolean)
      .map(parseCommitRecord);
  }

  const raw = git(`log --format=%H%x1f%s%x1f%b%x1e ${anchorCommit}..HEAD`);
  return raw
    .split('\x1e')
    .filter(Boolean)
    .map(parseCommitRecord);
}

function parseCommitRecord(record) {
  const [hash, subject = '', body = ''] = record.split('\x1f');
  return {
    hash: hash.trim(),
    subject: subject.trim(),
    body: body.trim(),
    message: `${subject.trim()}\n${body.trim()}`.trim(),
  };
}

function filesChangedInCommit(hash) {
  const raw = git(`diff-tree --no-commit-id --name-only -r ${hash}`);
  return raw ? raw.split('\n').filter(Boolean) : [];
}

function isInfraOnlyCommit(files) {
  if (files.length === 0) return true;
  const infraPattern =
    /^(eas\.json|app\.config\.js|\.github\/|scripts\/|package\.json|package-lock\.json|\.env|README)/;
  return files.every((f) => infraPattern.test(f));
}

function normalizeSubject(subject) {
  return subject.replace(/^[-–—]\s*/, '').trim();
}

function classifyCommit(commit) {
  const { subject: rawSubject, message, hash } = commit;
  const subject = normalizeSubject(rawSubject);
  const lower = `${subject}\n${message}`.toLowerCase();
  const files = filesChangedInCommit(hash);

  if (/breaking change|breaking:|!:|!\)|\bmajor\b/.test(lower)) {
    return 'major';
  }

  if (/^(feat|feature)(\(.+\))?!?:/i.test(subject)) {
    return 'major';
  }
  if (/^(fix|bugfix)(\(.+\))?!?:/i.test(subject)) {
    return 'major';
  }

  if (/^(feat|feature)(\(.+\))?:/i.test(subject)) {
    return 'minor';
  }

  if (
    /\b(add|added|adding|new feature|introduce|implement|support for)\b/.test(
      lower,
    )
  ) {
    return 'minor';
  }

  if (
    /^update\b/i.test(subject) &&
    /\b(for|login|auth|screen|flow|checkout|payment|notification|account|subscription|booking|meal)\b/i.test(
      lower,
    )
  ) {
    return 'minor';
  }

  if (/\b(delete account|account deletion|account work)\b/i.test(lower)) {
    return 'minor';
  }

  if (/^(fix|bugfix|hotfix|patch)(\(.+\))?:/i.test(subject)) {
    return 'patch';
  }

  if (/\b(fix|fixed|fixes|bug|hotfix|patch|resolve|resolved)\b/.test(lower)) {
    return 'patch';
  }

  if (/\b(icon|icons|style|styling|typo|copy|text|ui tweak|cosmetic)\b/.test(lower)) {
    return 'patch';
  }

  if (isInfraOnlyCommit(files) || /\b(eas|deploy|deployment|ci|build config|gradle|podfile)\b/.test(lower)) {
    return 'build';
  }

  if (/^(chore|ci|build|docs)(\(.+\))?:/i.test(subject)) {
    return 'build';
  }

  // Ambiguous "Update" without fix signals — treat as minor feature work.
  if (/^update\b/i.test(subject)) {
    return 'minor';
  }

  return 'patch';
}

function detectBumpType(commits) {
  if (commits.length === 0) {
    return { bumpType: 'build', reason: 'No commits since last version bump' };
  }

  const classified = commits.map((c) => ({
    ...c,
    bump: classifyCommit(c),
  }));

  let bumpType = 'build';
  for (const entry of classified) {
    if (BUMP_RANK[entry.bump] > BUMP_RANK[bumpType]) {
      bumpType = entry.bump;
    }
  }

  const drivers = classified.filter((c) => c.bump === bumpType);
  const reason =
    drivers.length === 1
      ? `Commit ${drivers[0].hash.slice(0, 7)}: ${drivers[0].subject}`
      : `${drivers.length} commits suggest ${bumpType} (highest severity since last bump)`;

  return { bumpType, reason, classified };
}

function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(
      `Invalid semver "${version}". Expected MAJOR.MINOR.PATCH (e.g. 1.2.3).`,
    );
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function bumpSemver(version, bumpType) {
  const { major, minor, patch } = parseSemver(version);
  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'build':
      return version;
    default:
      throw new Error(`Unknown bump type: ${bumpType}`);
  }
}

function nextBuildNumber(current) {
  const n = Number.parseInt(String(current ?? '0'), 10);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Invalid iOS buildNumber: ${current}`);
  }
  return String(n + 1);
}

function nextVersionCode(current) {
  const n = Number(current ?? 0);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Invalid Android versionCode: ${current}`);
  }
  return n + 1;
}

function syncPackageLock(version) {
  if (!fs.existsSync(PACKAGE_LOCK)) return;
  const lock = readJson(PACKAGE_LOCK);
  lock.version = version;
  if (lock.packages?.['']) {
    lock.packages[''].version = version;
  }
  writeJson(PACKAGE_LOCK, lock);
}

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const override = argv.find((a) => VALID_BUMPS.has(a));
  return { dryRun, override };
}

function usage() {
  console.error(
    'Usage: node scripts/update-mobile-versions.mjs [--dry-run] [major|minor|patch|build]',
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const unknown = args.filter((a) => a !== '--dry-run' && !VALID_BUMPS.has(a));
if (unknown.length > 0) usage();

const { dryRun, override } = parseArgs(args);

const anchor = findLastVersionBumpCommit();
const commits = commitsSinceVersionBump(anchor);
const detection = override
  ? { bumpType: override, reason: `Manual override: ${override}`, classified: [] }
  : detectBumpType(commits);

const app = readJson(APP_JSON);
const pkg = readJson(PACKAGE_JSON);
const currentVersion = app.expo?.version ?? pkg.version;
if (!currentVersion) {
  throw new Error('No version found in app.json or package.json');
}

const nextVersion = bumpSemver(currentVersion, detection.bumpType);
const prevIosBuild = app.expo?.ios?.buildNumber ?? '0';
const prevAndroidCode = app.expo?.android?.versionCode ?? 0;
const nextIosBuild = nextBuildNumber(prevIosBuild);
const nextAndroidCode = nextVersionCode(prevAndroidCode);

console.log('Chef2Home native version analysis');
console.log(`  current semver:  ${currentVersion}`);
console.log(`  anchor commit:   ${anchor ? anchor.slice(0, 7) : '(none)'}`);
console.log(`  commits since:   ${commits.length}`);
console.log(`  detected bump:   ${detection.bumpType}`);
console.log(`  reason:          ${detection.reason}`);

if (!override && detection.classified.length > 0) {
  console.log('');
  console.log('Recent commits considered:');
  for (const c of detection.classified.slice(0, 8)) {
    console.log(`  [${c.bump}] ${c.hash.slice(0, 7)} ${c.subject}`);
  }
  if (detection.classified.length > 8) {
    console.log(`  ... and ${detection.classified.length - 8} more`);
  }
}

console.log('');
console.log('Planned update:');
console.log(`  semver:        ${currentVersion} → ${nextVersion}`);
console.log(`  iOS build:     ${prevIosBuild} → ${nextIosBuild}`);
console.log(`  Android code:  ${prevAndroidCode} → ${nextAndroidCode}`);

if (dryRun) {
  console.log('');
  console.log('Dry run — no files changed.');
  process.exit(0);
}

app.expo.version = nextVersion;
app.expo.ios = app.expo.ios ?? {};
app.expo.android = app.expo.android ?? {};
app.expo.ios.buildNumber = nextIosBuild;
app.expo.android.versionCode = nextAndroidCode;
pkg.version = nextVersion;

writeJson(APP_JSON, app);
writeJson(PACKAGE_JSON, pkg);
syncPackageLock(nextVersion);

console.log('');
console.log('Updated: app.json, package.json, package-lock.json');
