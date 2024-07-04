import path from "path";
import { createLogger, format, transports, type Logger } from "winston";

let logger: Logger;

export const getLogger = (
  options: { console: boolean; file: boolean } = { console: true, file: true }
) => {
  const silent = process.env.NODE_ENV?.trim() === "test";
  if (logger == null) {
    logger = createLogger({
      transports: [
        ...(options.console ? [new transports.Console({ silent })] : []),
        ...(options.console
          ? [
              new transports.File({
                format: format.combine(format.timestamp(), format.json()),
                filename: path.join(
                  "C:",
                  "projects",
                  "location-host",
                  "location-host.log.json"
                ),
                silent,
              }),
            ]
          : []),
      ],
    });
  }
  return logger;
};
