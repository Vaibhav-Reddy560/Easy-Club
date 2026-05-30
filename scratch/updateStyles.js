const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// 1. More curved boxes
// Replace `rounded-sm` and `rounded` with `rounded-xl` for buttons and active items
content = content.replace(/rounded-sm/g, 'rounded-xl');
content = content.replace(/rounded([^a-zA-Z-])/g, 'rounded-xl$1');

// 2. Increase spacing
// Increase padding/margin for better visual hierarchy
content = content.replace(/gap-2/g, 'gap-4');
content = content.replace(/space-y-2/g, 'space-y-4');
content = content.replace(/space-y-3/g, 'space-y-5');
content = content.replace(/p-3 space-y-4/g, 'p-4 space-y-6');

// Slightly increase padding on the small items to fit the rounded-xl better
content = content.replace(/px-2 py-1.5/g, 'px-3 py-2.5');
content = content.replace(/px-3 py-1.5/g, 'px-4 py-2.5');

// For the specific Artboards and Layers sections in the left sidebar, the gap is currently not explicit, they are usually lists.
// In the sidebar, the buttons are rendered in an array. Let's make sure their parent flex has a gap or space-y.
// Actually, they might be rendered inside something like `space-y-1`. Let's increase it to `space-y-2`
content = content.replace(/space-y-1/g, 'space-y-2');

fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
console.log("Updated curving and spacing");
