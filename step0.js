const fs = require('fs');
const name = "Coinbase Exchange";
const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
const dir = `audits/${slug}`;
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(`${dir}/.exchange`, JSON.stringify({ name, slug, created: new Date().toISOString() }));
console.log(`Slug: ${slug} | Folder: ${dir}`);
