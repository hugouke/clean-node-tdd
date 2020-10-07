module.exports = {
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  root: true,

  extends: ['prettier'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: { semi: 'error' },
};
