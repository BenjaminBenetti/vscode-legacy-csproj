import { FileType, Uri, workspace } from "vscode";
import * as path from "path";

export default class CsprojLocator {
  // Directory path -> csproj file path or null if none found
  private _csprojLocationCache: Map<string, string | null> = new Map();
  // ========================================================
  // public methods
  // ========================================================

  /**
   *
   * @param _useCache - Whether or not to use the csproj location cache. Defaults to true.
   */
  constructor(private _useCache = true) {}

  /**
   * Find the nearest csproj file, looking upwards from the starting directory.
   * @param currDir - The directory to start looking from.
   * @param workspaceDir - The workspace directory. The search will stop when this directory is reached.
   */
  public async findNearestCsproj(
    currDir: string,
    workspaceDir: string,
  ): Promise<string | null> {
    // if caching is enabled and we have an entry for the current directory return it.
    if (this._useCache && this._csprojLocationCache.has(currDir)) {
      return this._csprojLocationCache.get(currDir) as string | null;
    }

    // if the current directory doesn't exist, move up a directory
    if (!(await this.fileExists(currDir))) {
      return this.findNearestCsproj(path.dirname(currDir), workspaceDir);
    }

    const dirFiles = await workspace.fs.readDirectory(Uri.file(currDir));

    for (const file of dirFiles) {
      if (file[1] === FileType.File && file[0].endsWith(".csproj")) {
        // cache the result
        if (this._useCache) {
          this._csprojLocationCache.set(currDir, path.join(currDir, file[0]));
        }
        return path.join(currDir, file[0]);
      }
    }

    if (currDir === workspaceDir) {
      return null;
    } else {
      const nearestCsproj = await this.findNearestCsproj(
        path.dirname(currDir),
        workspaceDir,
      );

      // cache the result
      if (this._useCache) {
        this._csprojLocationCache.set(currDir, nearestCsproj);
      }

      return nearestCsproj;
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
