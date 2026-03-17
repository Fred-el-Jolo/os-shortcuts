import { BrowserWindow } from "electrobun/bun";

const win = new BrowserWindow({
  title: "OS Shortcuts",
  url: "views://main-ui/index.html",
  width: 1200,
  height: 800,
});
