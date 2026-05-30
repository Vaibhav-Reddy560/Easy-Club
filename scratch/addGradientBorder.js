const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');

if (!css.includes('.border-gradient')) {
  const gradientClass = `
  .border-gradient {
    border: 1px solid transparent;
    background: linear-gradient(#111, #111) padding-box,
                linear-gradient(180deg, #FF8800 0%, #FF9D00 18%, #FFB405 36%, #FFBF44 49%, #F99A00 63%, #AE7102 100%) border-box;
  }
`;
  css = css.replace('@layer utilities {', '@layer utilities {' + gradientClass);
  fs.writeFileSync('app/globals.css', css);
}
