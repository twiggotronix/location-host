import { describe, expect, it } from "@jest/globals";
import type { NetworkInterfaceInfo } from "os";
import { getIpData } from "./ip-data";

describe("getIpData", () => {
  it("should map the network data to Ips", () => {
    const result = getIpData({
      wifi: [
        {
          family: "IPv4",
          address: "192.168.0.2",
          internal: false,
        } as NetworkInterfaceInfo,
      ],
      fake: [
        {
          family: "IPv4",
          address: "192.168.0.3",
          internal: true,
        } as NetworkInterfaceInfo,
      ],
      donkey: [
        {
          family: "IPv6",
          address: "2001:0000:130F:0000:0000:09C0:876A:130B",
          internal: false,
        } as NetworkInterfaceInfo,
      ],
      ethernet: [
        {
          family: "IPv4",
          address: "192.168.0.4",
          internal: false,
        } as NetworkInterfaceInfo,
      ],
    });
    expect(result).toEqual({ wifi: "192.168.0.2", ethernet: "192.168.0.4" });
  });
});
