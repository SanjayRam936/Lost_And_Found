const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');
const match = code.match(/const styles = `([\s\S]*?)`;/);
if (match) {
  fs.writeFileSync('src/index.css', match[1]);
  console.log('CSS extracted');
} else {
  console.log('No CSS found');
}
