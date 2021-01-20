import { program } from "commander";
import { isRunning, stop } from "../daemon/client";
import { startLanguageServer } from "../lsp";
import { dump } from "../utils/debug";
import { start } from "../daemon/manage";

// eslint-disable-next-line @typescript-eslint/no-var-requires -- package.json
program.version(require("../../package.json").version, "-v, --version");

program.command("start").action(async () => {
  const running = await isRunning();
  if (running) {
    console.info("already running");
    return;
  }
  const pid = start();
  console.info(`Server is started with pid ${pid}`);
  process.exit(0);
});
program.command("stop").action(async () => {
  const stopped = await stop();
  console.info(`${stopped ? "stopped" : "already stopped"}`);
  process.exit(0);
});
program.command("restart").action(async () => {
  await stop();
  const pid = start();
  console.info(`Server is restarted with pid ${pid}`);
  process.exit(0);
});
program.command("status").action(async () => {
  console.info(`${(await isRunning()) ? "running" : "not running"}`);
  process.exit(0);
});
{
  const command = program.command("lsp");
  command
    .allowUnknownOption()
    .option("--stdio", "Use stdin/stdout to communicate")
    .option("-e, --error", "report as errors")
    .action(() => {
      const options = command.opts();
      dump(options);
      startLanguageServer({ stdin: options.stdin });
    });
}
dump(process.argv);

program.parse(process.argv);
