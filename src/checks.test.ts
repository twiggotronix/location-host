import { describe, expect, it, jest } from "@jest/globals";
import { doChecks } from "./checks";
import type { Ips } from "./types";
import * as utils from "./utils/file";

describe("doChekcs", () => {
  const fakeFilePath = "fake-host-file";
  const fakeFileData = "fake content";
  describe("happy path", () => {
    it("should return true if all tests pass", () => {
      const checkFileIsReadableSpy = jest
        .spyOn(utils, "checkFileIsReadable")
        .mockReturnValue({ success: true, data: fakeFileData });
      const checkFileIsWritableSpy = jest
        .spyOn(utils, "checkFileIsWritable")
        .mockReturnValue(true);

      const result = doChecks({ wifi: "192.168.0.5" }, fakeFilePath);

      expect(checkFileIsReadableSpy).toHaveBeenCalledWith(fakeFilePath);
      expect(checkFileIsWritableSpy).toHaveBeenCalledWith(
        fakeFilePath,
        fakeFileData
      );
      expect(result).toBeTruthy();
    });
  });

  describe("check fail", () => {
    it("should return false if file is not readable", () => {
      const checkFileIsReadableSpy = jest
        .spyOn(utils, "checkFileIsReadable")
        .mockReturnValue({ success: false });
      const checkFileIsWritableSpy = jest
        .spyOn(utils, "checkFileIsWritable")
        .mockReturnValue(true);

      const result = doChecks({ wifi: "192.168.0.5" }, fakeFilePath);

      expect(checkFileIsReadableSpy).toHaveBeenCalledWith(fakeFilePath);
      expect(result).toBeFalsy();
    });

    it("should return false if file is not writtable", () => {
      const fakeFilePath = "fake-host-file";
      const checkFileIsReadableSpy = jest
        .spyOn(utils, "checkFileIsReadable")
        .mockReturnValue({ success: true, data: fakeFileData });
      const checkFileIsWritableSpy = jest
        .spyOn(utils, "checkFileIsWritable")
        .mockReturnValue(false);

      const result = doChecks({ wifi: "192.168.0.5" }, fakeFilePath);

      expect(checkFileIsReadableSpy).toHaveBeenCalledWith(fakeFilePath);
      expect(checkFileIsWritableSpy).toHaveBeenCalledWith(
        fakeFilePath,
        fakeFileData
      );
      expect(result).toBeFalsy();
    });
  });

  describe("input errors", () => {
    it("should throw an error if no IPs are provided", () => {
      expect(() => {
        doChecks({}, "hosts");
      }).toThrow("No networks found");
    });

    it("should throw an error if IPs is null", () => {
      expect(() => {
        doChecks(null as unknown as Ips, "hosts");
      }).toThrow("No networks found");
    });
  });
});
