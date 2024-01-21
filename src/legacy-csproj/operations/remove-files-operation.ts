import CsprojService from "../../csproj/csproj-service";
import { logger } from "../../logger";
import vscode from "vscode";
import path from "path";

export default class RemoveFilesOperation {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * remove one or more files or folders from the project.
   * @param files - the files to remove
   */
  public async removeFilesFromProject(
    files: readonly vscode.Uri[],
  ): Promise<void> {
    try {
      const csprojService = new CsprojService(true);
      await this.recursiveRemove(files, csprojService);
      csprojService.flush();
    } catch (error) {
      logger.error(`Unexpected error while deleting files ${error}`);
      throw error;
    }
  }

  // ========================================================
  // private methods
  // ========================================================

  private async recursiveRemove(
    files: readonly vscode.Uri[],
    csprojService: CsprojService,
  ): Promise<void> {
    for (const file of files) {
      const fileStat = await vscode.workspace.fs.stat(file);

      if (fileStat.type === vscode.FileType.File) {
        await csprojService.removeFileFromCsproj(file.fsPath);
      } else if (fileStat.type === vscode.FileType.Directory) {
        const files = await vscode.workspace.fs.readDirectory(file);

        await this.recursiveRemove(
          files.map((fl) => vscode.Uri.file(path.join(file.fsPath, fl[0]))),
          csprojService,
        );
      }
    }
  }
}
