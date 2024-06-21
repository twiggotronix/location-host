import path from "path";
import { createLogger, format, transports } from "winston";

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

export const getLogger = () => logger;
