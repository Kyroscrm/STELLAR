import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_BUNDLE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

// Get the dist directory
const distDir = path.join(__dirname, '..', 'dist', 'assets');

try {
  // Read all JS files in the dist/assets directory
  const files = fs.readdirSync(distDir).filter(file => file.endsWith('.js'));

  let totalSize = 0;
  const largeFiles = [];

  // Calculate total size and identify large files
  files.forEach(file => {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;

    if (stats.size > 300 * 1024) { // 300KB threshold for individual files
      largeFiles.push({
        name: file,
        size: (stats.size / 1024 / 1024).toFixed(2) + 'MB'
      });
    }
  });

  console.log('\nBundle Size Analysis:');
  console.log('--------------------');
  console.log(`Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);

  if (largeFiles.length > 0) {
    console.log('\nLarge modules (>300KB):');
    largeFiles.forEach(file => {
      console.log(`- ${file.name}: ${file.size}`);
    });
  }

  if (totalSize > MAX_BUNDLE_SIZE) {
    console.error('\n❌ Bundle size exceeds limit!');
    console.error(`Maximum allowed: ${(MAX_BUNDLE_SIZE / 1024 / 1024).toFixed(2)}MB`);
    process.exit(1);
  } else {
    console.log('\n✅ Bundle size is within limits');
  }
} catch (error) {
  console.error('Error analyzing bundle size:', error);
  process.exit(1);
}
