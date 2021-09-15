import ipc from 'node-ipc';
import type { PublishDiagnosticsParams } from 'vscode-languageserver';
import type { VFileDiagnostics } from '../utils/vfile-to-lsp-diagnositcs.js';
import { VFileToLSPDiagnostics } from '../utils/vfile-to-lsp-diagnositcs.js';
import { debug, daemonName } from './const.js';
import { dump } from '../utils/debug.js';

const entries = <T>(
  obj: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): T extends { [key in keyof T]: infer U } ? U[] : any[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const es: any = [];
  // eslint-disable-next-line no-restricted-syntax,@typescript-eslint/no-explicit-any,guard-for-in
  for (const e in obj as any) es.push((obj as any)[e]);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return es;
};

const setup = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  if (!debug.enabled) ipc.config.logger = () => {};
  ipc.config.id = daemonName;
  ipc.config.retry = 1500;
};

const startServer = () => {
  setup();
  const files: { [path: string]: PublishDiagnosticsParams } = Object.create(null);
  ipc.serve(() => {
    ipc.server.on('reportFiles', (data) => {
      dump('server: reportFiles: received');
      data.forEach((file: VFileDiagnostics) => {
        files[file.path] = VFileToLSPDiagnostics(file);
      });
      dump('server: reportFiles: broadcasting "notifyFiles"...');
      ipc.server.broadcast('notifyFiles', data);
    });
    ipc.server.on('getAllFiles', (_data, socket) => {
      dump('server: getAllFiles: replying "notifyFiles"...');
      ipc.server.emit(socket, 'notifyFiles', entries(files));
    });
    ipc.server.on('stop', () => {
      process.exit(0);
    });
    ipc.server.on('socket.disconnected', (_socket, destroyedSocketID) => {
      ipc.log(`client ${destroyedSocketID} has disconnected!`);
    });
  });
  ipc.server.start();
};

process.title = daemonName;
startServer();
