// import { dateFormatWithTime } from "./dateFormat";

const ENABLE_LOGS = process.env.NEXT_PUBLIC_ENABLE_LOGS === "true";
// console.log("ENABLE_LOGS:---->", ENABLE_LOGS);

// OR process.env.NODE_ENV !== "production"

const format = (type, args) => {
  // const time = new Date().toISOString();
  return [`[${type.toUpperCase()}]:`, ...args];
};

export const logger = {
  log: (...args) => {
    if (!ENABLE_LOGS) return;
    console.log(...format("log", args));
  },

  info: (...args) => {
    if (!ENABLE_LOGS) return;
    console.info(...format("info", args));
  },

  warn: (...args) => {
    if (!ENABLE_LOGS) return;
    console.warn(...format("warn", args));
  },

  error: (...args) => {
    if (!ENABLE_LOGS) return;
    console.error(...format("error", args));
  },

  table: (data) => {
    if (!ENABLE_LOGS) return;
    console.table(data);
  },

  group: (label) => {
    if (!ENABLE_LOGS) return;
    console.group(label);
  },

  groupEnd: () => {
    if (!ENABLE_LOGS) return;
    console.groupEnd();
  },
};
