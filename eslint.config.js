module.exports = [
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "coverage/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "error",
      "consistent-return": "error",
    },
  },
  {
    files: ["server.js"],
    rules: {
      "no-console": "off",
    },
  },
];
