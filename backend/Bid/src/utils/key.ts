export function getKeyName(...args: string[]) {
  return `bitly:${args.join(":")}`;
}

