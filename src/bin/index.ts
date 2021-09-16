/* eslint-disable no-console */
import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { isRunning, stop } from '../daemon/client.js';
import { startLanguageServer } from '../lsp/index.js';
import { dump } from '../utils/debug.js';
import { start } from '../daemon/manage.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
program.version(
  (
    JSON.parse(
      fs.readFileSync(path.resolve(url.fileURLToPath(import.meta.url), '../../../package.json')).toString(),
    ) as any
  ).version,
  '-v, --version',
);
/* eslint-enable @typescript-eslint/no-explicit-any */

{
  const command = program.command('start');
  command.option('-a, --attach', 'Not to detach').action(async () => {
    const { attach } = command.opts();
    const running = await isRunning();
    if (running) {
      console.info('already running');
      return;
    }
    if (attach) {
      await import('../daemon/server.js');
    } else {
      const pid = start();
      console.info(`Server is started with pid ${pid}`);
      process.exit(0);
    }
  });
}
program.command('stop').action(async () => {
  const stopped = await stop();
  console.info(`${stopped ? 'stopped' : 'already stopped'}`);
  process.exit(0);
});
{
  const command = program.command('restart');
  command.option('-a, --attach', 'Not to detach').action(async () => {
    const { attach } = command.opts();
    await stop();
    if (attach) {
      await import('../daemon/server.js');
    } else {
      const pid = start();
      console.info(`Server is restarted with pid ${pid}`);
      process.exit(0);
    }
  });
}
program.command('status').action(async () => {
  console.info(`${(await isRunning()) ? 'running' : 'not running'}`);
  process.exit(0);
});
{
  const command = program.command('lsp');
  command
    .allowUnknownOption()
    .option('--stdio', 'Use stdin/stdout to communicate')
    .action(() => {
      const options = command.opts();
      dump(options);
      try {
        startLanguageServer({ stdio: options.stdio });
      } catch (e: unknown) {
        dump({ mes: 'error on creation LSP Client', e });
        throw e;
      }
    });
}
dump(process.argv);

program.parse(process.argv);
/* eslint-enable no-console */
