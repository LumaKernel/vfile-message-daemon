let x = 0;

export const invoke = (
  cwd: string,
  args: string[],
  text: string,
  mtime: number,
  hanldeResult: (err: unknown, result: string | Buffer | Uint8Array) => void,
): void => {
  args.shift();
  x += 1;
  hanldeResult(null, `Now: ${x} ${JSON.stringify({ cwd, args, text, mtime })}`);
};

export const getStatus: () => string = () => {
  return String(x);
};
