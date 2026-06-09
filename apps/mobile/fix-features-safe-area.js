const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app/features');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  // Remove SafeAreaView from react-native import
  if (content.includes('SafeAreaView')) {
    const oldContent = content;
    content = content.replace(/SafeAreaView,\s*/g, '');
    content = content.replace(/,\s*SafeAreaView/g, '');
    
    // Check if the file imports from safe-area-context
    if (!content.includes('react-native-safe-area-context')) {
      // Add import at top
      content = "import { SafeAreaView } from 'react-native-safe-area-context';\n" + content;
    }

    // Replace <SafeAreaView style={...}> with <SafeAreaView style={...} edges={['top']}>
    // We should be careful not to duplicate edges={['top']}
    content = content.replace(/<SafeAreaView([^>]*)>/g, (match, attrs) => {
      if (attrs.includes('edges=')) return match;
      return `<SafeAreaView${attrs} edges={['top']}>`;
    });

    if (content !== oldContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Patched ${file}`);
    }
  }
});
