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
  // First verify that LICENSE would fail without the ignore file
  let hasErrorWithoutIgnore = false;
  try {
    // Create a temporary empty ignore file to test without ignoring LICENSE
    const tempIgnore = path.join(ROOT, '.markdownlintignore.test.tmp');
    fs.writeFileSync(tempIgnore, '# empty ignore file for testing\n', 'utf-8');
    
    try {
      execSync(`npx markdownlint LICENSE --ignore-path "${tempIgnore}"`, {
        cwd: ROOT,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      hasErrorWithoutIgnore = output.includes('LICENSE') && output.includes('MD041');
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempIgnore)) {
        fs.unlinkSync(tempIgnore);
      }
    }
  } catch (error) {
    throw new Error(`Failed to test LICENSE without ignore: ${error.message}`);
  }
  
  assert(hasErrorWithoutIgnore, 'LICENSE should trigger MD041 error without ignore file');
  
  // Now verify that LICENSE is ignored with the ignore file
  let hasErrorWithIgnore = false;
  let exitCode = 0;
  try {
    execSync('npx markdownlint LICENSE -p .markdownlintignore', {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    // If we get here, the command succeeded (exit code 0)
    // This means either no files were linted or no errors were found
    hasErrorWithIgnore = false;
  } catch (error) {
    exitCode = error.status || 1;
    const output = error.stdout || error.stderr || '';
    // Only consider it an error if the output explicitly mentions LICENSE and MD041
    hasErrorWithIgnore = output.includes('LICENSE') && output.includes('MD041');
  }
  
  assert(!hasErrorWithIgnore, 'LICENSE file should be ignored and not trigger MD041 error');
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
