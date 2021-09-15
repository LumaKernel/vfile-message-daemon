import createDebug from 'debug';
import * as path from 'path';
import * as url from 'url';

export const daemonName = `vfile_message_daemon${
  process.env.TEST_VFMD_PREFIX ? `_test_${process.env.TEST_VFMD_PREFIX}` : ''
}`;
export const serverPath = path.resolve(url.fileURLToPath(import.meta.url), '../server.js');
export const debug = createDebug(
  `vfile_message_daemon${process.env.TEST_VFMD_PREFIX ? `:test:${process.env.TEST_VFMD_PREFIX}` : ''}`,
);
