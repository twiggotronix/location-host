import { readFileSync, writeFileSync } from "fs";
import { getLogger } from "./logger";
import type { Ips } from "./types";

const checkFileIsReadable = (
  file: string
): Promise<{ success: boolean; data?: string }> => {
  return new Promise<{ success: boolean; data?: string }>((resolve) => {
    try {
      const data = readFileSync(file, { encoding: "utf8" });
      getLogger().info(`✅ Can read ${file}`);
      resolve({ success: true, data });
    } catch (err) {
      getLogger().error(`⚠️ Can't read ${file}`);
      resolve({ success: false });
    }
  });
};
const checkFileIsWritable = (file: string, data: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    try {
      writeFileSync(file, data);
      getLogger().info(`✅ Can write ${file}`);
      resolve(true);
    } catch (err) {
      getLogger().error(`⚠️ Can't write ${file}`);
      resolve(false);
    }
  });
};

const doChekcs = (ips: Ips, filePath: string): Promise<boolean> => {
  return new Promise<boolean>(async (resolve, reject) => {
    if (Object.keys(ips).length === 0) {
      getLogger().error("⚠️ No networks found");
      reject(false);
    }
    const fileIsReadableCheckResult = await checkFileIsReadable(filePath);
    if (
      fileIsReadableCheckResult.success &&
      fileIsReadableCheckResult.data != null
    ) {
      if (await checkFileIsWritable(filePath, fileIsReadableCheckResult.data)) {
        resolve(true);
      } else {
        reject(false);
      }
    } else {
      reject(false);
    }
  });
};

export { doChekcs };
