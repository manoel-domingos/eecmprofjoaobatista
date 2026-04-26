const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, '../lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

const date = new Date();
const options = { timeZone: 'America/Cuiaba', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
const formatter = new Intl.DateTimeFormat('pt-BR', options);

const parts = formatter.formatToParts(date);
const getPart = (type) => parts.find(p => p.type === type)?.value || '00';

const year = getPart('year');
const month = getPart('month');
const day = getPart('day');
const hour = getPart('hour');
const minute = getPart('minute');

const versionStr = `${day}.${month}.${year}.${hour}:${minute}`;
const filePath = path.join(libDir, 'version.json');

fs.writeFileSync(filePath, JSON.stringify({ version: versionStr }, null, 2));
console.log(`Version injected: ${versionStr}`);
