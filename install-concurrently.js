const { execSync } = require('child_process');

console.log('Installing concurrently package...');

try {
  execSync('npm install concurrently --save-dev', { stdio: 'inherit' });
  console.log('✅ Concurrently installed successfully!');
} catch (error) {
  console.error('❌ Error installing concurrently:', error.message);
}
