const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app/(tabs)');
const files = ['explore.tsx', 'calendar.tsx', 'profile.tsx'];

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import from safe-area-context if not exists
  if (!content.includes('import { SafeAreaView } from \'react-native-safe-area-context\'')) {
    content = "import { SafeAreaView } from 'react-native-safe-area-context';\n" + content;
  }

  fs.writeFileSync(filePath, content);
  console.log(`Patched ${file}`);
});
