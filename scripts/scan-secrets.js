import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SENSITIVE_PATTERNS = [
  {
    name: 'MongoDB Credentialed URI',
    regex: /mongodb(?:\+srv)?:\/\/[^\s/:?#]+:[^\s/:?#]+@[^\s/?#]+/i,
  },
  {
    name: 'Private Key Block',
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /ghp_[0-9a-zA-Z]{36}/,
  },
  {
    name: 'Generic AWS Access Key ID',
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
  },
];

const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git[/\\]/,
  /dist[/\\]/,
  /\.log$/,
  /package-lock\.json$/,
  /scripts[/\\]scan-secrets\.js$/,
  /server[/\\]tests[/\\]securityRemediation\.test\.js$/, // Contains testing regex definitions
];

function getTrackedFiles() {
  try {
    const stdout = execSync('git ls-files', { cwd: rootDir, encoding: 'utf8' });
    return stdout
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function scan() {
  console.log('==================================================');
  console.log('  NESTMATCH REPOSITORY SECRET SCANNER');
  console.log('==================================================\n');

  const trackedFiles = getTrackedFiles();
  let findings = 0;

  for (const relativePath of trackedFiles) {
    if (IGNORE_PATTERNS.some((pattern) => pattern.test(relativePath))) {
      continue;
    }

    const fullPath = path.join(rootDir, relativePath);
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      continue;
    }

    // Verify .env files are not tracked (except .env.example)
    if (/\.env(?:\..+)?$/i.test(relativePath) && !relativePath.endsWith('.env.example')) {
      console.error(`[CRITICAL LEAK] Real .env file is tracked in Git: ${relativePath}`);
      findings++;
      continue;
    }

    let content = '';
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {
      // Binary file, skip
      continue;
    }

    const lines = content.split('\n');
    lines.forEach((line, index) => {
      for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.regex.test(line)) {
          console.error(
            `[FINDING] ${pattern.name} detected at ${relativePath}:${index + 1}`
          );
          findings++;
        }
      }
    });
  }

  if (findings === 0) {
    console.log('[PASS] Repository scan clean. Zero exposed secrets or tracked credential files detected.\n');
    process.exit(0);
  } else {
    console.error(`\n[FAIL] Found ${findings} sensitive pattern finding(s). Remediate before pushing.\n`);
    process.exit(1);
  }
}

scan();
