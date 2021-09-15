import type { VFile } from 'vfile';
import { getClientShortLived } from './daemon/client.js';

// eslint-disable-next-line import/prefer-default-export
export const reportToDaemon = async (files: VFile | VFile[]): Promise<boolean> => {
  if (!Array.isArray(files)) return reportToDaemon([files]);

  const client = await getClientShortLived();
  if (client === null) return false;

  const diagnostics = files
    .filter((file) => file.path)
    .map((file) => ({
      path: file.path,
      messages: file.messages,
    }));

  client.emit('reportFiles', diagnostics);

  client.disconnect();

  return true;
};
