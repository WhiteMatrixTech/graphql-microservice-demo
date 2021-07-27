const path = require('path');

module.exports = {
  extends: ['plugin:@typescript-eslint/recommended-requiring-type-checking'],
  parserOptions: {
    project: path.join(__dirname, 'tsconfig.test.json')
  }
};
