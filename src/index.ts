import select from "@inquirer/select";
import { createReadStream, readFileSync, writeFile, writeFileSync } from "fs";
import { EOL, networkInterfaces, type NetworkInterfaceInfo } from "os";
import * as path from "path";
import { createInterface } from "readline/promises";
import { parseArgs } from "util";
import { createLogger, format, transports } from "winston";
const flag = "[location-host]";
const nets = networkInterfaces();

const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({
      format: format.combine(format.timestamp(), format.json()),
      filename: path.join(
        "C:",
        "projects",
        "location-host",
        "location-host.log.json"
      ),
    }),
  ],
});

type Ips = { [intf: string]: string };

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

const getIpData = (): Ips => {
  return Object.keys(nets)
    .filter((intf) => !/^(vEthernet|Loopback).*/.test(intf))
    .reduce((carry, intf: string) => {
      const localIps = (nets[intf] as NetworkInterfaceInfo[])
        .filter((info) => info.family === "IPv4" && !info.internal)
        .map((info) => info.address);

      return { ...carry, [intf]: localIps[0] };
    }, {});
};

const checkFileIsReadable = (
  file: string
): Promise<{ success: boolean; data?: string }> => {
  return new Promise<{ success: boolean; data?: string }>((resolve) => {
    try {
      const data = readFileSync(file, { encoding: "utf8" });
      logger.info(`✅ Can read ${file}`);
      resolve({ success: true, data });
    } catch (err) {
      logger.error(`⚠️ Can't read ${file}`);
      resolve({ success: false });
    }
  });
};
const checkFileIsWritable = (file: string, data: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    try {
      writeFileSync(file, data);
      logger.info(`✅ Can write ${file}`);
      resolve(true);
    } catch (err) {
      logger.error(`⚠️ Can't write ${file}`);
      resolve(false);
    }
  });
};

const doChekcs = (ips: Ips, filePath: string): Promise<boolean> => {
  return new Promise<boolean>(async (resolve, reject) => {
    if (Object.keys(ips).length === 0) {
      logger.error("⚠️ No networks found");
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

const gatherInfo = async (ips: Ips): Promise<string> => {
  const choices = Object.keys(ips).map((intf) => ({
    value: ips[intf],
    name: `Interface ${intf} (${ips[intf]})`,
  }));
  if (args.values.wifi || args.values.ethernet) {
    const preSelectedNetwork: keyof Ips | undefined = Object.keys(ips).find(
      (network) =>
        network.toLowerCase() === (args.values.wifi ? "wi-fi" : "ethernet")
    );
    if (preSelectedNetwork) {
      logger.info(
        `ℹ️ Pre-select ${preSelectedNetwork} (${ips[preSelectedNetwork]})`
      );
      return ips[preSelectedNetwork];
    } else {
      logger.info(
        `⚠️ Network ${
          args.values.wifi ? "Wi-Fi" : "Ethernet"
        } not found, please select an existing one`
      );
    }
  } else {
    logger.info(`⚠️ No pre-selected value`);
  }
  if (args.values.headless) {
    throw new Error("cannot select network in headless mode");
  }
  return select({
    message: "Pick an interface",
    choices,
  });
};

const setNewIp = async (newIp: string) => {
  const fileStream = createReadStream(hostFilePath);

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  const ipRegex =
    /(25[0–5]|2[0-5][0-9]?|1[0-9]?[0-9]?|[0-9][0-9]?)\.(25[0–5]|2[0-5][0-9]?|1[0-9]?[0-9]?|[0-9][0-9]?)\.(25[0–5]|2[0-5][0-9]?|1[0-9]?[0-9]?|[0-9][0-9]?)\.(25[0–5]|2[0-5][0-9]?|1[0-9]?[0-9]?|[0-9][0-9]?)/;

  let fileContents = "";
  for await (const line of rl) {
    if (line.includes(flag)) {
      const ip2Replace = line.match(ipRegex);
      if (ip2Replace != null) {
        fileContents += line.replace(ip2Replace[0], newIp);
      }
    } else {
      fileContents += line;
    }
    fileContents += EOL;
  }

  writeFile(hostFilePath, fileContents, (err) => {
    if (err) {
      logger.error(`❌ Failed to write to ${hostFilePath}`, err);
    } else {
      logger.info(`✅ Ip was succefully updated in ${hostFilePath}`);
    }
  });
};

const main = async () => {
  logger.info(`running location-host`);
  const ips = getIpData();
  const checksOk = await doChekcs(ips, hostFilePath).catch((err) => {
    logger.error("❌ Checks were not successfull", err);
    return false;
  });
  if (checksOk) {
    const selectedIp = await gatherInfo(ips);
    logger.info(`ℹ️ Selected IP: ${selectedIp}`);
    await setNewIp(selectedIp);
  }
};
main();
