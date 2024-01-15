const { defineConfig } = require('@vscode/test-cli');


module.exports = defineConfig({
  files: ['out/**/*.test.js'],
  workspaceFolder: './test-env/test-project/'
});