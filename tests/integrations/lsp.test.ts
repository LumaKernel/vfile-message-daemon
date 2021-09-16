import waitForExpect from 'wait-for-expect';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import assert from 'assert';
import find from 'find-process';
import { retext } from 'retext';
import * as vfile from 'to-vfile';
import type { VFile } from 'vfile';
import * as path from 'path';
import * as url from 'url';
import { createDaemonContext, mainBinary } from '../helpers/daemon-context';
import { samplePlugin } from './fixtures/sample-plugin';

const execFileAsync = promisify(execFile);
const ctx = createDaemonContext();

test('report to daemon and ls-client receives', async () => {
  {
    const child = await execFileAsync('node', [mainBinary, 'start'], {
      env: process.env,
    });
    const matches = child.stdout.match(/\d+/);
    assert(matches);
    const [pid] = matches;
    assert(pid);
    ctx.pushPid(pid);
    const procs = await find('pid', pid);
    const [proc] = procs;

    assert(proc);
    expect(proc).toBeTruthy();
  }

  const lsClient = spawn('node', [mainBinary, 'lsp', '--stdio'], {
    env: process.env,
    stdio: ['pipe', 'pipe', 'ignore'],
  });
  await new Promise((resolve) => setTimeout(resolve, 4000));
  const { pid } = lsClient;
  assert(typeof pid === 'number');
  ctx.pushPid(pid);

  const [stdin, stdout] = lsClient.stdio;
  let stdoutText = '';
  stdout.on('data', (data) => {
    stdoutText += data.toString();
  });

  const sampleFile = vfile.readSync(path.resolve(url.fileURLToPath(import.meta.url), '../fixtures/sample.txt'));

  const sendJSONRPC = (json: ReadonlyJSONValue) => {
    const raw = Buffer.from(JSON.stringify(json));
    stdin.write(Buffer.concat([Buffer.from(`Content-Length: ${raw.length}\r\n\r\n`), raw]));
  };

  sendJSONRPC({
    id: 1,
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      capabilities: {
        workspace: { configuration: true, applyEdit: true },
        textDocument: {
          synchronization: {
            dynamicRegistration: false,
            willSaveWaitUntil: false,
            willSave: false,
            didSave: true,
          },
        },
      },
      clientInfo: { name: 'test-ls-client' },
      trace: 'off',
    },
  });

  await waitForExpect(() => {
    expect(stdoutText).toContain('capabilities');
  });
  stdoutText = '';

  retext()
    .use(samplePlugin)
    .process(sampleFile, (_err: any, file: VFile) => {
      void (async () => {
        const { reportToDaemon } = await import('../../dist/index.js');
        await reportToDaemon(file);
      })();
    });

  await waitForExpect(() => {
    expect(stdoutText).toContain('Problem: ERROR');
    expect(stdoutText).toContain('Problem: WARN');
  });

  lsClient.kill();

  await waitForExpect(async () => {
    const procs = await find('pid', pid);
    expect(procs).toHaveLength(0);
  });
});
