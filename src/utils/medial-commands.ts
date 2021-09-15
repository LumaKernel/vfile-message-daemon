export type CreateMedialCommandDescriptor<Name extends string, Input = null, Output = null> = {
  name: Name;
  input: Input;
  callback: (output: Output) => void;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createMedialCommand = (
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runner: (...args: any[]) => void,
) => ({ name, runner });
