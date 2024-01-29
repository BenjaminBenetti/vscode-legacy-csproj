import CsprojService from "../../csproj/csproj-service";
import { logger } from "../../logger";
import vscode from "vscode";
import path from "path";
import CsprojIgnoreService from "../../ignore/csproj-ignore-service";

export interface RenameFile {
  oldUri: vscode.Uri;
  newUri: vscode.Uri;
}

export default class RenameFilesOperation {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * Rename the given files and directories in the project
   * @param files - the files and directories to rename.
   */
  public async renameProjectFiles(files: readonly RenameFile[]): Promise<void> {
    try {
      const csprojService = new CsprojService(true);
      const ignoreService = new CsprojIgnoreService();
      await this.recursiveRename(files, csprojService, ignoreService);
      csprojService.flush();
    } catch (error) {
      logger.error(`Unexpected error while renaming files ${error}`);
    }
  }

  // ========================================================
  // private methods
  // ========================================================

  private async recursiveRename(
    files: readonly RenameFile[],
    csprojService: CsprojService,
    ignoreService: CsprojIgnoreService,
  ): Promise<void> {
    for (const file of files) {
      const fileStat = await vscode.workspace.fs.stat(file.oldUri);
      if (fileStat.type === vscode.FileType.File) {
        if (!(await ignoreService.isFileIgnored(file.oldUri.fsPath))) {
          await csprojService.removeFileFromCsproj(file.oldUri.fsPath);
        }
        if (!(await ignoreService.isFileIgnored(file.newUri.fsPath))) {
          await csprojService.addFileToCsproj(file.newUri.fsPath);
        }
      } else if (fileStat.type === vscode.FileType.Directory) {
        const files = await vscode.workspace.fs.readDirectory(file.oldUri);
        await this.recursiveRename(
          files.map((fl) => ({
            oldUri: vscode.Uri.parse(path.join(file.oldUri.fsPath, fl[0])),
            newUri: vscode.Uri.parse(path.join(file.newUri.fsPath, fl[0])),
          })),
          csprojService,
          ignoreService,
        );
      }
    }
  }
}
