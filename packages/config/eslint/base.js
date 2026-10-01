/** Shared ESLint baseline for Know Your Route packages. Extend from app configs. */
module.exports = {
  root: false,
  env: {
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  ignorePatterns: ['dist', 'coverage', 'node_modules'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    eqeqeq: ['error', 'always'],
  },
};
