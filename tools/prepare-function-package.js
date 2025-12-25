// tools/prepare-function-package.js
const fs = require("fs");
const path = require("path");

const rootPkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
const distDir = path.join(__dirname, "..", "dist");
const distPkgPath = path.join(distDir, "package.json");

// minimal runtime package.json for Firebase Functions
const runtimePkg = {
  name: rootPkg.name,
  version: rootPkg.version,
  private: true,
  main: "main.js",             // 👈 tell Firebase our entry file
  dependencies: rootPkg.dependencies,
};

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(distPkgPath, JSON.stringify(runtimePkg, null, 2));

console.log("✅ Prepared dist/package.json for Firebase Functions.");
