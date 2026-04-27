const fs = require('fs');
const path = require('path');

const srcDir = 'public';
const destDir = 'dist/public';

function copyRecursive(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read directory contents
  const files = fs.readdirSync(src);

  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      // Recursively copy directories
      copyRecursive(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Copy public folder to dist
if (fs.existsSync(srcDir)) {
  copyRecursive(srcDir, destDir);
  console.log('✅ Copied public/ to dist/public/');
} else {
  console.warn('⚠️ public/ folder not found');
}
