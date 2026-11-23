import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

Config.setPublicDir("./videos");
Config.setVideoImageFormat("jpeg");
// Navegador já instalado no ambiente da nuvem (evita download).
const shell = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (existsSync(shell)) Config.setBrowserExecutable(shell);
