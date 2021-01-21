import { program } from "commander";
import { isRunning, stop } from "../daemon/client";
import { startLanguageServer } from "../lsp";
import { dump } from "../utils/debug";
import { start } from "../daemon/manage";

// eslint-disable-next-line @typescript-eslint/no-var-requires -- package.json
program.version(require("../../package.json").version, "-v, --version");

{
  const command = program.command("start");
  command.option("-a, --attach", "Not to detach").action(async () => {
    const { attach } = command.opts();
    const running = await isRunning();
    if (running) {
      console.info("already running");
      return;
    }
    if (attach) {
      require("../daemon/server");
    } else {
      const pid = start();
      console.info(`Server is started with pid ${pid}`);
      process.exit(0);
    }
  });
}
program.command("stop").action(async () => {
  const stopped = await stop();
  console.info(`${stopped ? "stopped" : "already stopped"}`);
  process.exit(0);
});
{
  const command = program.command("restart");
  command.option("-a, --attach", "Not to detach").action(async () => {
    const { attach } = command.opts();
    await stop();
    if (attach) {
      require("../daemon/server");
    } else {
      const pid = start();
      console.info(`Server is restarted with pid ${pid}`);
      process.exit(0);
    }
  });
}
program.command("status").action(async () => {
  console.info(`${(await isRunning()) ? "running" : "not running"}`);
  process.exit(0);
});
{
  const command = program.command("lsp");
  command
    .allowUnknownOption()
    .option("--stdio", "Use stdin/stdout to communicate")
    .action(() => {
      const options = command.opts();
      dump(options);
      startLanguageServer({ stdio: options.stdio });
    });
}
dump(process.argv);

program.parse(process.argv);
