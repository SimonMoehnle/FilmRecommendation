import { logToFile } from "../utils/logger.js";

export async function writeLog({ message, level = "info", metadata = {} }) {
  try {
    logToFile(message, level, metadata);
  } catch (error) {
    console.error("❌ Fehler beim Schreiben in Logdatei:", error);
  }
}
