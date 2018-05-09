import * as fs from "fs-extra";

declare module "fs" {
  export function exists(path: fs.PathLike): Promise<boolean>;
}
