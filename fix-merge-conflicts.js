const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Attempting to fix merge conflicts and Git index issues...');

try {
  // Step 1: Reset Git index
  console.log('Resetting Git index...');
  execSync('git reset', { stdio: 'inherit' });
  
  // Step 2: Clean working directory
  console.log('Cleaning working directory of untracked files...');
  execSync('git clean -fd', { stdio: 'inherit' });
  
  // Step 3: Fix Git index if corrupted
  console.log('Removing Git index file if corrupted...');
  try {
    fs.unlinkSync(path.join('.git', 'index'));
    console.log('Removed corrupted Git index.');
  } catch (err) {
    console.log('No index file to remove or cannot access it.');
  }
  
  // Step 4: Reset again after index removal
  console.log('Resetting Git state...');
  execSync('git reset', { stdio: 'inherit' });
  
  // Step 5: Pull latest changes
  console.log('Pulling latest changes...');
  execSync('git pull --no-rebase', { stdio: 'inherit' });
  
  console.log('\nMerge conflicts may still need manual resolution in:');
  console.log('- package.json');
  console.log('- package-lock.json');
  console.log('- src/App.js');
  console.log('\nAfter resolving conflicts, run:');
  console.log('git add .');
  console.log('git commit -m "Resolved merge conflicts"');
  
} catch (error) {
  console.error('\nError during merge fix:', error.message);
  console.log('\nTry running these commands manually:');
  console.log('git reset');
  console.log('git clean -fd');
  console.log('del .git\\index (Windows) or rm -f .git/index (Unix)');
  console.log('git reset');
  console.log('git pull');
}
