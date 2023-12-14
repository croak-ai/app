/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
      "./apps/*/tsconfig.json",
      "./packages/*/tsconfig.json",
      "./packages/api/*/tsconfig.json",
    ],
  },
  ignorePatterns: ["build/"],
  plugins: ["@typescript-eslint"],
  extends: ["plugin:@typescript-eslint/recommended"],
};
