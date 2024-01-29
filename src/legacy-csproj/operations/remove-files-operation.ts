import CsprojService from "../../csproj/csproj-service";
import { logger } from "../../logger";
import vscode from "vscode";
import path from "path";
import CsprojIgnoreService from "../../ignore/csproj-ignore-service";

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
      const ignoreService = new CsprojIgnoreService();
      await this.recursiveRemove(files, csprojService, ignoreService);
      csprojService.flush();
    } catch (error) {
      logger.error(`Unexpected error while deleting files ${error}`);
      throw error;
    }
  }

  // ========================================================
  // private methods
  // ========================================================

  /**
   * recursively remove the given files from the csproj
   * @param files - the files to remove
   * @param csprojService - the csproj service to use
   * @param ignoreService - the ignore service to use
   */
  private async recursiveRemove(
    files: readonly vscode.Uri[],
    csprojService: CsprojService,
    ignoreService: CsprojIgnoreService,
  ): Promise<void> {
    for (const file of files) {
      if (await ignoreService.isFileIgnored(file.fsPath)) {
        logger.info(`Ignoring remove of ${file.fsPath}`);
        continue;
      }

      const fileStat = await vscode.workspace.fs.stat(file);
      if (fileStat.type === vscode.FileType.File) {
        await csprojService.removeFileFromCsproj(file.fsPath);
      } else if (fileStat.type === vscode.FileType.Directory) {
        const files = await vscode.workspace.fs.readDirectory(file);

        await this.recursiveRemove(
          files.map((fl) => vscode.Uri.file(path.join(file.fsPath, fl[0]))),
          csprojService,
          ignoreService,
        );
      }
    }
  }
}
