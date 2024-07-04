import { describe, expect, it, jest } from "@jest/globals";
import * as winston from "winston";
import { getLogger } from "./logger";

jest.mock("winston");

describe("logger", () => {
  it("should call createLogger and return the result", () => {
    jest
      .spyOn(winston, "createLogger")
      .mockReturnValue("fakeLogger" as unknown as winston.Logger);
    const result = getLogger({ console: false, file: false });

    expect(winston.createLogger).toHaveBeenCalled();
    expect(result).toEqual("fakeLogger");
  });
});
