#!/usr/bin/env node
// Checks that a pull request description follows the template: "Why" and
// "AI tools used" are filled in, and the author ticked "I read this change in
// full and stand behind it". CI runs it with the description in PR_BODY and
// the author in PR_AUTHOR (never interpolated into a shell command).
//
//   PR_BODY="…" PR_AUTHOR=name node scripts/check-pr.mjs
const body = (process.env.PR_BODY || '').replace(/\r\n/g, '\n').replace(/<!--[\s\S]*?-->/g, '');
const author = process.env.PR_AUTHOR || '';

if (author.endsWith('[bot]')) {
  console.log(`skipped: ${author} is a bot`);
  process.exit(0);
}

function section(name) {
  const m = body.match(new RegExp(`^##\\s+${name}\\s*$([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, 'mi'));
  return m ? m[1].trim() : null;
}

const problems = [];
const why = section('Why');
if (why === null) problems.push('The "## Why" section is missing. Use the pull request template.');
else if (!why) problems.push('The "## Why" section is empty. Explain in your own words why this change is needed.');
const ai = section('AI tools used');
if (ai === null) problems.push('The "## AI tools used" section is missing. Use the pull request template.');
else if (!ai) problems.push('The "## AI tools used" section is empty. Name the AI tools that helped, or write "none".');
if (!/^\s*[-*]\s*\[[xX]\]\s*I read this change in full and stand behind it/m.test(body)) {
  problems.push('Tick "I read this change in full and stand behind it" once you have read the whole change.');
}

if (problems.length) {
  for (const p of problems) console.log(`::error title=Pull request description::${p}`);
  console.log('\nEdit the pull request description to fix this; the check runs again automatically.');
  process.exit(1);
}
console.log('pull request description: ok');
