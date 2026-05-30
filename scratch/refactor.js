const fs = require('fs');
const path = require('path');

const componentsMove = {
  views: ["AboutPage", "AccountView", "AnalyticsView", "ExploreClubsView", "LoginView", "MembershipView", "MyTeamView", "SettingsView"],
  layout: ["AppSidebar", "Sidebar", "MobileNav", "DynamicIsland", "TaskOverlay", "CursorGlow"],
  features: ["ClubGrid", "CollabHub", "EventIdeation", "EventReportModal", "EventStatusModal", "ExploreClubs", "ExploreEvents", "IdeationBrainstorm", "Questionnaire", "ResourceRadar", "SocialTracker", "SponsorshipManager", "TalentMatrix", "TrendingIdeas"],
  providers: ["ClientInit", "theme-provider"]
};

const libMove = {
  services: ["firebase", "firebase-admin", "firebase_social", "supabase", "gemini", "openai", "huggingface", "resend", "ayrshare", "google-maps"],
  utils: ["discovery", "db", "export-utils", "fonts", "validation"],
  context: ["TaskContext"]
};

const BASE_DIR = '/Users/vaibhavreddy/Demo/easy-club-app';

// 1. Create directories
for (const cat of Object.keys(componentsMove)) {
  fs.mkdirSync(path.join(BASE_DIR, 'components', cat), { recursive: true });
}
for (const cat of Object.keys(libMove)) {
  fs.mkdirSync(path.join(BASE_DIR, 'lib', cat), { recursive: true });
}

// 2. Move files and build replacement map
const replacements = [];

for (const [cat, files] of Object.entries(componentsMove)) {
  for (const fileBase of files) {
    const ext = fs.existsSync(path.join(BASE_DIR, 'components', `${fileBase}.tsx`)) ? '.tsx' : (fs.existsSync(path.join(BASE_DIR, 'components', `${fileBase}.ts`)) ? '.ts' : null);
    if (!ext) continue;
    
    const oldPath = path.join(BASE_DIR, 'components', fileBase + ext);
    const newPath = path.join(BASE_DIR, 'components', cat, fileBase + ext);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      // @/components/X -> @/components/cat/X
      replacements.push({
        from: new RegExp(`@/components/${fileBase}(?!/|\\w)`, 'g'),
        to: `@/components/${cat}/${fileBase}`
      });
      // Also handle relative imports if any just in case
      replacements.push({
        from: new RegExp(`\\.\\./components/${fileBase}(?!/|\\w)`, 'g'),
        to: `../components/${cat}/${fileBase}`
      });
      // In case they used . or ./ in components dir
      replacements.push({
        from: new RegExp(`\\.\\/${fileBase}(?!/|\\w)`, 'g'),
        to: `./${cat}/${fileBase}`
      });
    }
  }
}

for (const [cat, files] of Object.entries(libMove)) {
  for (const fileBase of files) {
    const ext = fs.existsSync(path.join(BASE_DIR, 'lib', `${fileBase}.tsx`)) ? '.tsx' : (fs.existsSync(path.join(BASE_DIR, 'lib', `${fileBase}.ts`)) ? '.ts' : null);
    if (!ext) continue;
    
    const oldPath = path.join(BASE_DIR, 'lib', fileBase + ext);
    const newPath = path.join(BASE_DIR, 'lib', cat, fileBase + ext);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      replacements.push({
        from: new RegExp(`@/lib/${fileBase}(?!/|\\w)`, 'g'),
        to: `@/lib/${cat}/${fileBase}`
      });
    }
  }
}

// 3. Scan and replace in all .ts, .tsx files
function walkDir(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    const filePath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'dist' || file.startsWith('.')) return;
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walkDir(filePath));
    } else { 
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const allFiles = walkDir(BASE_DIR);

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const rule of replacements) {
    if (rule.from.test(content)) {
      content = content.replace(rule.from, rule.to);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${file.replace(BASE_DIR, '')}`);
  }
}

console.log('Refactoring complete!');
