import { Config } from "@remotion/cli/config";
import fs from "fs";
import path from "path";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPublicDir(path.resolve(process.cwd(), "public"));

Config.overrideWebpackConfig((current) => {
  return {
    ...current,
    resolve: {
      ...current.resolve,
      fallback: {
        ...current.resolve?.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        child_process: false,
      },
    },
  };
});


// Dynamically resolve Chrome binary across environments (CI, macOS, Linux, Windows)
const envBrowser = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
if (envBrowser && fs.existsSync(envBrowser)) {
  Config.setBrowserExecutable(envBrowser);
} else if (process.platform === "win32") {
  const winCandidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe` : "",
  ].filter(Boolean);

  for (const candidate of winCandidates) {
    if (fs.existsSync(candidate)) {
      Config.setBrowserExecutable(candidate);
      break;
    }
  }
}

