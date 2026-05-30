const { parse } = require('csv-parse/sync');

const rawRows = parse(',,,,\n,,,,\n,,,,\n', { skip_empty_lines: true });
console.log(rawRows);
const rows = rawRows.filter(row => row.some(cell => cell && String(cell).trim().length > 0));
console.log(rows.length);
