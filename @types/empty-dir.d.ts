declare module "empty-dir" {
  export function sync(path: string, filter?: (path: string) => boolean): void;
}
