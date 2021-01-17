import type { VFile } from "vfile";

export const reportToDaemon = (vfile: VFile): void => {
  for (const message of vfile.messages) {
    message.fatal;
  }
};
