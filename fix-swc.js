const fs = require('fs');
const https = require('https');
const path = require('path');
const zlib = require('zlib');
const tar = require('tar');

const targetUrl = 'https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.21.tgz';
const targetDir = path.join(__dirname, 'node_modules', '@swc', 'helpers');

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });

https.get(targetUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error('Failed to download:', response.statusCode);
    process.exit(1);
  }

  const extract = tar.x({
    C: targetDir,
    strip: 1 // Strip the 'package' root folder from the tarball
  });

  response.pipe(zlib.createGunzip()).pipe(extract)
    .on('finish', () => {
      console.log('Successfully installed @swc/helpers manually.');
    })
    .on('error', (err) => {
      console.error('Extraction error:', err);
    });
}).on('error', (err) => {
  console.error('Download error:', err);
});
