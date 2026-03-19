export default {
  app: {
    name: "OS Shortcuts",
    identifier: "dev.os.shortcuts",
    version: "0.1.0",
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    copy: {
      "src/main-ui/index.html": "views/main-ui/index.html",
    },
  },
};
