const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');

const EDGE_FUNCTIONS_DIR = path.join(__dirname, '../supabase/functions');

// Patterns to check for
const SECURITY_PATTERNS = {
  EVAL_USAGE: /eval\s*\(/,
  DYNAMIC_IMPORT: /import\s*\(/,
  UNSAFE_REGEX: /\/.*\*+.*\//,
  UNESCAPED_INPUT: /req\.body|req\.query|req\.params/,
  HARDCODED_SECRETS: /(password|secret|key|token|auth).*=.*['"][A-Za-z0-9+/=]{8,}['"]/,
};

// Security rules
const rules = {
  checkForEval: (content) => {
    return SECURITY_PATTERNS.EVAL_USAGE.test(content);
  },
  checkForDynamicImports: (content) => {
    return SECURITY_PATTERNS.DYNAMIC_IMPORT.test(content);
  },
  checkForUnsafeRegex: (content) => {
    return SECURITY_PATTERNS.UNSAFE_REGEX.test(content);
  },
  checkForUnvalidatedInput: (content) => {
    return SECURITY_PATTERNS.UNESCAPED_INPUT.test(content) &&
           !content.includes('zod') &&
           !content.includes('validator');
  },
  checkForHardcodedSecrets: (content) => {
    return SECURITY_PATTERNS.HARDCODED_SECRETS.test(content);
  },
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Check for security patterns
  Object.entries(rules).forEach(([ruleName, rule]) => {
    if (rule(content)) {
      issues.push(`[${ruleName}] Potential security issue found in ${filePath}`);
    }
  });

  // Parse and analyze AST
  try {
    const ast = acorn.parse(content, {
      sourceType: 'module',
      ecmaVersion: 'latest',
    });

    // Check for unsafe variable usage
    walk.simple(ast, {
      MemberExpression(node) {
        if (node.property.name === 'innerHTML' ||
            node.property.name === 'outerHTML') {
          issues.push(`[DOM_XSS] Potentially unsafe DOM manipulation in ${filePath}`);
        }
      },
    });
  } catch (e) {
    issues.push(`[PARSE_ERROR] Could not parse ${filePath}: ${e.message}`);
  }

  return issues;
}

function scanEdgeFunctions() {
  if (!fs.existsSync(EDGE_FUNCTIONS_DIR)) {
    console.error('Edge functions directory not found!');
    process.exit(1);
  }

  const issues = [];

  // Recursively scan all .ts and .js files
  function scanDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDir(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const fileIssues = analyzeFile(filePath);
        issues.push(...fileIssues);
      }
    });
  }

  scanDir(EDGE_FUNCTIONS_DIR);

  // Output results
  if (issues.length > 0) {
    console.error('Security issues found:');
    issues.forEach(issue => console.error(`- ${issue}`));
    process.exit(1);
  } else {
    console.log('No security issues found in edge functions.');
    process.exit(0);
  }
}

scanEdgeFunctions();
