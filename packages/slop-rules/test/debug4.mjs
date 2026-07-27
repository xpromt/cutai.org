const patterns = [
  /not (?:just )?(\w+(?:\s+\w+)?) (?:but |, but )(\w+(?:\s+\w+)?)/gi,
  /isn['’]t (\w+(?:\s+\w+)?) [-–—] it['’]s (\w+(?:\s+\w+)?)/gi,
];
const text = "Not just a tool, but a platform that transforms everything. This isn't a feature — it's a revolution.";
for (const re of patterns) {
  let m;
  let count = 0;
  while ((m = re.exec(text)) !== null) {
    console.log(`Match: "${m[0]}"`);
    count++;
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  console.log(`Pattern ${re}: count=${count}`);
}
