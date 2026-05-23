module.exports = {
  extends: [require.resolve("./base.cjs"), "next/core-web-vitals"],
  rules: {
    "@next/next/no-html-link-for-pages": "off"
  },
  settings: {
    next: {
      rootDir: ["apps/web/"]
    }
  }
};
