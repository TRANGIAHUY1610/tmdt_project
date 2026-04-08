const fs = require("fs");
const path = require("path");

const files = [
  "src/server.js",
  "src/app.js",
  "src/routes/api.js",
  "src/config/env.js",
  "src/config/validateEnv.js",
];

for (const file of files) {
  const fullPath = path.resolve(__dirname, "..", "..", file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

console.log("Project structure check passed.");
