const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// 1. Add border border-transparent and transition-all to inactive states in the sidebar
// For Artboards
content = content.replace(
  /'text-\[#C0C0C0\] hover:bg-white\/5'/g,
  "'text-[#C0C0C0] hover:bg-white/5 border border-transparent transition-all duration-300'"
);

// 2. Add space-y-3 wrappers around the mapped elements in the sidebar to increase spacing
content = content.replace(
  /\{FORMATS\.filter\(f => f\.id !== "certificate"\)\.map\(f => \(/,
  '<div className="space-y-3 mt-2">\n            {FORMATS.filter(f => f.id !== "certificate").map(f => ('
);
// Close the div after the map
content = content.replace(
  /<\/button>\n            \)\)}\n          <\/div>/,
  '</button>\n            ))}\n            </div>\n          </div>'
);

content = content.replace(
  /\{\(\['header', 'title', 'tagline', 'details', 'tags', 'footer', 'background'\] as Layer\[\]\)\.map\(layer => \(/,
  '<div className="space-y-3 mt-2">\n            {(["header", "title", "tagline", "details", "tags", "footer", "background"] as Layer[]).map(layer => ('
);
content = content.replace(
  /<\/button>\n            \)\)}\n          <\/div>\n\n          \{\/\* Generation Progress \*\/\}/,
  '</button>\n            ))}\n            </div>\n          </div>\n\n          {/* Generation Progress */}'
);

fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
console.log("Fixed sidebar layout shifting and spacing");
