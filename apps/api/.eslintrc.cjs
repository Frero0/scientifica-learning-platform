module.exports = {
  root: true,
  extends: [require.resolve("@scientifica/config/eslint/node")],
  rules: {
    "@typescript-eslint/consistent-type-imports": "off"
  }
};
