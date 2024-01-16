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
    // if the current directory doesn't exist, move up a directory
    if (!(await this.fileExists(currDir))) {
      return this.findNearestCsproj(path.dirname(currDir), workspaceDir);
    }

    const dirFiles = await workspace.fs.readDirectory(Uri.file(currDir));

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

  // ========================================================
  // private methods
  // ========================================================

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await workspace.fs.stat(Uri.file(filePath));
      return true;
    } catch (error) {
      return false;
    }
  }
}
