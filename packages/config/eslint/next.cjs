module.exports = {
  extends: [require.resolve("./base.cjs"), "next/core-web-vitals"],
  settings: {
    next: {
      rootDir: ["apps/web/"]
    }
  }
};
