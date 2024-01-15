import { FileType, Uri, workspace } from "vscode";
import * as path from "path";

export default class CsprojLocator {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * Find the nearest csproj file, looking upwards from the starting directory.
   * @param currDir - The directory to start looking from.
   * @param workspaceDir - The workspace directory. The search will stop when this directory is reached.
   */
  public async findNearestCsproj(
    currDir: string,
    workspaceDir: string,
  ): Promise<string | null> {
    const dirFiles = await workspace.fs.readDirectory(Uri.parse(currDir));

    for (const file of dirFiles) {
      if (file[1] === FileType.File && file[0].endsWith(".csproj")) {
        return path.join(currDir, file[0]);
      }
    }

    if (currDir === workspaceDir) {
      return null;
    } else {
      return this.findNearestCsproj(path.dirname(currDir), workspaceDir);
    }
  }
}
