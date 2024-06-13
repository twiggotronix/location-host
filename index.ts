import select from "@inquirer/select";
import { createReadStream, writeFile } from "fs";
import { EOL } from "node:os";
import { networkInterfaces, type NetworkInterfaceInfo } from "os";
import path from "path";
import { createInterface } from "readline/promises";

const flag = "[location-host]";
const filename = path.join(
  "C:",
  "Windows",
  "System32",
  "drivers",
  "etc",
  "hosts"
);
const nets = networkInterfaces();

type Ips = { [intf: string]: string };
const ips: Ips = Object.keys(nets)
  .filter((intf) => !/^(vEthernet|Loopback).*/.test(intf))
  .reduce((carry, intf: string) => {
    const localIps = (nets[intf] as NetworkInterfaceInfo[])
      .filter((info) => info.family === "IPv4" && !info.internal)
      .map((info) => info.address);

    return { ...carry, [intf]: localIps[0] };
  }, {});

const gatherInfo = async (ips: Ips) => {
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
  const fileStream = createReadStream(filename);

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

  writeFile(filename, fileContents, (err) => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
    }
  });
};
gatherInfo(ips).then(async (selectedIp) => {
  console.log(`Selected IP: ${selectedIp}`);
  await setNewIp(selectedIp);
});
