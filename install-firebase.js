const { execSync } = require('child_process');

console.log('Installing Firebase dependencies...');

try {
  execSync('npm install firebase@10.7.1', { stdio: 'inherit' });
  console.log('\nFirebase installed successfully!');
  console.log('\nYou can now run the application with: npm start');
} catch (error) {
  console.error('\nError installing Firebase:', error.message);
  console.log('\nPlease try running: npm install firebase@10.7.1');
}
