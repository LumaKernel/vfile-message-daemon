export const setupEnv: () => void = () => {
  process.env.CORE_D_TITLE = "vfile_reporter_daemon";
  process.env.CORE_D_DOTFILE = ".vfile_reporter_d";
  process.env.CORE_D_SERVICE = require.resolve("../../service");
};
