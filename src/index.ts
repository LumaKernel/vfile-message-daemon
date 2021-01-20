import type { VFile } from "vfile";
import { getClientShortLived } from "./daemon/client";

export const reportToDaemon = async (
  files: VFile | VFile[],
): Promise<boolean> => {
  if (!Array.isArray(files)) return reportToDaemon([files]);

  const client = await getClientShortLived();
  if (client === null) return false;

  const diagnositcs = files
    .filter((file) => file.path)
    .map((file) => ({
      path: file.path,
      messages: file.messages,
    }));

  client.emit("reportFiles", diagnositcs);

  client.disconnect();

  return true;
};
