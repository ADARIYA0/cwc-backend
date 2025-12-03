export const LOG_DIR = process.env.LOG_DIR || "logs";
export const ERROR_LOG_DIR = `${LOG_DIR}/error`;

export const DATE_PATTERN = "DD-MM-YYYY";

// Lama penyimpanan logs biasa
export const MAX_LOG_FILES = "14d";

// Lama penyimpanan logs error
export const MAX_ERROR_LOG_FILES = "30d";

// Level default
export const ENV = process.env.NODE_ENV || "development";
export const LOG_LEVEL = ENV === "development" ? "debug" : "info";
