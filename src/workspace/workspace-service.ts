import path from "path";
import { workspace } from "vscode";

export default class WorkspaceService {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * Find the nearest workspace that contains the given file
   * @param filePath - the path to the file
   * @returns - the path to the nearest workspace if found, null otherwise
   */
  public getWorkspacePathForFile(filePath: string): string | null {
    for (const projectRoot of workspace.workspaceFolders ?? []) {
      // only look for csproj files in the workspace that contains the given file
      if (!path.relative(projectRoot.uri.fsPath, filePath).includes("..")) {
        return projectRoot.uri.fsPath;
      }
    }
    return null;
  }
}
