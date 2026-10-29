import { requestLogContext } from "@/utils/logContext";
import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(format(info => Object.assign(info, requestLogContext()))(), format.timestamp(), format.json()),
  defaultMeta: { service: "commentsy" },
  transports: [new transports.Console({ stderrLevels: [], consoleWarnLevels: [] })],
});

export default logger;
