import * as path from "path";
import { parseArgs } from "util";
import { doChekcs } from "./checks";
import { gatherInfo } from "./gather-info";
import { getIpData } from "./ip-data";
import { getLogger } from "./logger";
import { setNewIp } from "./set-ips";

const presumedHostFilePath =
  process.platform === "win32"
    ? path.join("C:", "Windows", "System32", "drivers", "etc", "hosts")
    : path.join("etc", "hosts");

const args = parseArgs({
  options: {
    wifi: {
      type: "boolean",
      short: "w",
      default: false,
    },
    ethernet: {
      type: "boolean",
      short: "e",
      default: false,
    },
    hostsFile: {
      type: "string",
      short: "f",
      default: presumedHostFilePath,
    },
    headless: {
      type: "boolean",
      short: "h",
      default: false,
    },
  },
});

const hostFilePath = args.values.hostsFile ?? presumedHostFilePath;

const main = async () => {
  getLogger().info(`running location-host`);
  const ips = getIpData();
  const checksOk = await doChekcs(ips, hostFilePath).catch((err) => {
    getLogger().error("❌ Checks were not successfull", err);
    return false;
  });
  if (checksOk) {
    const selectedIp = await gatherInfo(ips, {
      ethernet: args.values.ethernet ?? false,
      headless: args.values.headless ?? false,
      wifi: args.values.wifi ?? false,
    });
    getLogger().info(`ℹ️ Selected IP: ${selectedIp}`);
    await setNewIp(selectedIp, hostFilePath);
  }
};
main();
