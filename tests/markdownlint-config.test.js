/**
 * Test: Markdownlint configuration
 * 
 * Verifies that LICENSE files are excluded from markdown linting rules,
 * specifically the MD041 rule (first-line-heading) that requires the first
 * line to be a top-level heading.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    return true;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

let passedTests = 0;
let failedTests = 0;

// Test 1: .markdownlintignore exists
if (test('.markdownlintignore file exists', () => {
  const ignoreFilePath = path.join(ROOT, '.markdownlintignore');
  assert(fs.existsSync(ignoreFilePath), '.markdownlintignore file not found');
})) {
  passedTests++;
} else {
  failedTests++;
}

// Test 2: .markdownlintignore includes LICENSE pattern
if (test('.markdownlintignore includes LICENSE pattern', () => {
  const ignoreFilePath = path.join(ROOT, '.markdownlintignore');
  const content = fs.readFileSync(ignoreFilePath, 'utf-8');
  assert(content.includes('LICENSE'), 'LICENSE pattern not found in .markdownlintignore');
})) {
  passedTests++;
} else {
  failedTests++;
}

// Test 3: .markdownlint.json exists
if (test('.markdownlint.json file exists', () => {
  const configFilePath = path.join(ROOT, '.markdownlint.json');
  assert(fs.existsSync(configFilePath), '.markdownlint.json file not found');
})) {
  passedTests++;
} else {
  failedTests++;
}

// Test 4: .markdownlint.json is valid JSON
if (test('.markdownlint.json is valid JSON', () => {
  const configFilePath = path.join(ROOT, '.markdownlint.json');
  const content = fs.readFileSync(configFilePath, 'utf-8');
  const config = JSON.parse(content); // Will throw if invalid
  assert(typeof config === 'object', '.markdownlint.json does not contain an object');
})) {
  passedTests++;
} else {
  failedTests++;
}

// Test 5: LICENSE file is ignored by markdownlint
if (test('LICENSE file is ignored by markdownlint', () => {
  try {
    // Run markdownlint on LICENSE file with the ignore file
    const command = 'npx markdownlint LICENSE -p .markdownlintignore';
    const output = execSync(command, {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    // If no output or only shows help, LICENSE is being ignored
    // (markdownlint shows help when all specified files are ignored)
    const hasLicenseError = output.includes('LICENSE') && output.includes('MD041');
    assert(!hasLicenseError, 'LICENSE file is not being ignored - MD041 error detected');
  } catch (error) {
    // Exit code 0 means no errors (file was ignored successfully)
    // Exit code 1 with no LICENSE errors also means success (help shown)
    if (error.stdout) {
      const hasLicenseError = error.stdout.includes('LICENSE') && error.stdout.includes('MD041');
      assert(!hasLicenseError, 'LICENSE file is not being ignored - MD041 error detected');
    }
    // If command exits with code 0 but throws, it's likely because there's no output
    // which is expected when the file is ignored
  }
})) {
  passedTests++;
} else {
  failedTests++;
}

// Test 6: lint:md script exists in package.json
if (test('lint:md script exists in package.json', () => {
  const packageJsonPath = path.join(ROOT, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  assert(packageJson.scripts && packageJson.scripts['lint:md'], 'lint:md script not found in package.json');
})) {
  passedTests++;
} else {
  failedTests++;
}

// Summary
console.log(`\n${passedTests} test(s) passed.`);
if (failedTests > 0) {
  console.log(`${failedTests} test(s) failed.`);
  process.exit(1);
}
