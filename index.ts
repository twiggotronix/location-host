import select from "@inquirer/select";
import { access, constants, createReadStream, writeFile } from "fs";
import { EOL } from "node:os";
import { networkInterfaces, type NetworkInterfaceInfo } from "os";
import * as path from "path";
import { createInterface } from "readline/promises";
import { createLogger, transports } from "winston";

const flag = "[location-host]";
const hostFilePath =
  process.platform === "win32"
    ? path.join("C:", "Windows", "System32", "drivers", "etc", "hosts")
    : path.join("etc", "hosts");
const nets = networkInterfaces();

type Ips = { [intf: string]: string };

const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: "location-host.log.json" }),
  ],
});

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
const doChekcs = async (): Promise<boolean> => {
  const readCheck = new Promise<boolean>((resolve) => {
    access(hostFilePath, constants.R_OK, (err) => {
      if (err) {
        logger.error(`Can't read ${hostFilePath}`);
        throw new Error(`Can't read ${hostFilePath}`);
      }
      logger.info(`Can read ${hostFilePath}`);
      resolve(true);
    });
  });
  const writeCheck = new Promise<boolean>((resolve) => {
    access(hostFilePath, constants.W_OK, (err) => {
      if (err) {
        logger.error(`Can't write ${hostFilePath}`);
        throw new Error(`Can't write to ${hostFilePath}`);
      }
      logger.info(`Can write ${hostFilePath}`);
      resolve(true);
    });
  });

  const [canRead, canWrite] = await Promise.all([readCheck, writeCheck]);
  return canRead && canWrite;
};
const gatherInfo = async (ips: Ips): Promise<string> => {
  const choices = Object.keys(ips).map((intf) => ({
    value: ips[intf],
    name: `Interface ${intf} (${ips[intf]})`,
  }));
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
      logger.error(err);
    } else {
      logger.info("✅ host file written");
    }
  });
};

const main = async () => {
  const ips = getIpData();
  await doChekcs();
  const selectedIp = await gatherInfo(ips);
  logger.info(`Selected IP: ${selectedIp}`);
  await setNewIp(selectedIp);
};
main();
