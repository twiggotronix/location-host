import select from "@inquirer/select";
import { describe, expect, it, jest } from "@jest/globals";
import { gatherInfo } from "./gather-info";

jest.mock("@inquirer/select", () => jest.fn());

const mockNetworks = {
  "wi-fi": "192.168.0.2",
  ethernet: "192.168.0.4",
};
describe("gather-info", () => {
  it("should return the wifi network", async () => {
    const result = await gatherInfo(mockNetworks, { wifi: true });
    expect(result).toEqual(mockNetworks["wi-fi"]);
  });

  it("should return the ethernet network", async () => {
    const result = await gatherInfo(mockNetworks, { ethernet: true });
    expect(result).toEqual(mockNetworks.ethernet);
  });

  it("should call select if no networks are requested", async () => {
    await gatherInfo(mockNetworks, {});
    expect(select).toHaveBeenCalledWith({
      message: "Pick a network interface",
      choices: [
        {
          value: mockNetworks["wi-fi"],
          name: `Interface wi-fi (${mockNetworks["wi-fi"]})`,
        },
        {
          value: mockNetworks.ethernet,
          name: `Interface ethernet (${mockNetworks.ethernet})`,
        },
      ],
    });
  });

  it("should call select if wifi requested but not wifi networks are available", async () => {
    const mockNetworks = { ethernet: "192.168.0.4" };
    await gatherInfo(mockNetworks, { wifi: true });
    expect(select).toHaveBeenCalledWith({
      message: "Pick a network interface",
      choices: [
        {
          value: mockNetworks.ethernet,
          name: `Interface ethernet (${mockNetworks.ethernet})`,
        },
      ],
    });
  });

  describe("headless", () => {
    it("should throw an error if wifi requested but not wifi networks are available", async () => {
      const mockNetworks = { ethernet: "192.168.0.4" };
      await expect(async () => {
        await gatherInfo(mockNetworks, { wifi: true, headless: true });
      }).rejects.toThrow("Cannot select network in headless mode");
    });
  });
});
