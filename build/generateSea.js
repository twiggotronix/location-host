const { exec } = require("child_process");

const _generateBlob = () => {
  return new Promise((resolve, reject) => {
    exec("node --experimental-sea-config build/sea-config.json", (err) => {
      if (err) {
        reject("SEA config failure", err);
      }
      resolve();
    });
  });
};
const _generateExe = () => {
  return new Promise((resolve, reject) => {
    exec(
      "node -e \"require('fs').copyFileSync(process.execPath, 'dist/location-host.exe')\"",
      (err) => {
        if (err) {
          reject("Generating exe failure", err);
        }
        resolve();
      }
    );
  });
};
const _injectExe = () => {
  return new Promise((resolve, reject) => {
    exec(
      "npx postject dist/location-host.exe NODE_SEA_BLOB dist/sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
      (err) => {
        if (err) {
          reject("Injecting exe failure", err);
        }
        resolve();
      }
    );
  });
};
const generateSEA = async () => {
  await _generateBlob();
  await _generateExe();
  await _injectExe();
  console.log("Executable generated");
};

module.exports = { generateSEA };
