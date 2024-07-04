import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as fs from "fs";
import { afterEach } from "node:test";
import { EOL } from "os";
import { PassThrough } from "stream";
import { flag } from "./constants";
import { setNewIp } from "./set-ips";

jest.mock("fs");
const getLoggerMock = jest.fn();
jest.mock("./logger").mocked(() => ({
  getLogger: getLoggerMock,
}));

const prepareMockFile = (mockData: string) => {
  const mockReadStream = new PassThrough();
  process.nextTick(() => {
    mockReadStream.write(mockData);
    mockReadStream.end();
  });
  jest
    .spyOn(fs, "createReadStream")
    .mockReturnValue(mockReadStream as unknown as fs.ReadStream);
};
describe("setIp", () => {
  describe("happy path", () => {
    beforeEach(() => {
      jest.spyOn(fs, "writeFile").mockImplementation(jest.fn());
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("should not replace anything", async () => {
      const mockData = "Example data";
      prepareMockFile(mockData);
      await setNewIp("192.168.0.2", "fake-file");

      expect(fs.writeFile).toHaveBeenCalledWith(
        "fake-file",
        `${mockData}${EOL}`,
        expect.any(Function)
      );
    });

    it("should replace the given ip", async () => {
      const mockData = `192.168.1.57 my-local-ip # ${flag}
192.168.0.1 another-test
aaa
123.156.12.244 to-replace # ${flag}`;
      const expectedData = `192.168.0.2 my-local-ip # ${flag}${EOL}192.168.0.1 another-test${EOL}aaa${EOL}192.168.0.2 to-replace # ${flag}${EOL}`;
      prepareMockFile(mockData);
      await setNewIp("192.168.0.2", "fake-file");

      expect(fs.writeFile).toHaveBeenCalledWith(
        "fake-file",
        expectedData,
        expect.any(Function)
      );
    });
  });
});
