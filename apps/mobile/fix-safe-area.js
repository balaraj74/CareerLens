const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app/(tabs)');
const files = ['index.tsx', 'explore.tsx', 'calendar.tsx', 'profile.tsx'];

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove SafeAreaView from react-native import
  content = content.replace(/SafeAreaView,\s*/g, '');
  
  // Add import from safe-area-context if not exists
  if (!content.includes('react-native-safe-area-context')) {
    content = content.replace(
      /(import .* from 'react-native';)/,
      "$1\nimport { SafeAreaView } from 'react-native-safe-area-context';"
    );
  }

  // Add edges={['top']} to <SafeAreaView
  content = content.replace(/<SafeAreaView style=\{styles\.safe\}>/g, "<SafeAreaView style={styles.safe} edges={['top']}>");

  fs.writeFileSync(filePath, content);
  console.log(`Patched ${file}`);
});
