import { networkInterfaces, type NetworkInterfaceInfo } from "os";
import type { Ips } from "./types";

const nets = networkInterfaces();

export const getIpData = (): Ips => {
  return Object.keys(nets)
    .filter((intf) => !/^(vEthernet|Loopback).*/.test(intf))
    .reduce((carry, intf: string) => {
      const localIps = (nets[intf] as NetworkInterfaceInfo[])
        .filter((info) => info.family === "IPv4" && !info.internal)
        .map((info) => info.address);

      return { ...carry, [intf]: localIps[0] };
    }, {});
};