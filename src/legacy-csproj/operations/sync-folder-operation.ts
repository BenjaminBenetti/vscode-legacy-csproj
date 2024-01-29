import vscode from "vscode";
import { FileType, Uri } from "vscode";
import { logger } from "../../logger";
import CsprojService from "../../csproj/csproj-service";
import path from "path";
import CsprojIgnoreService from "../../ignore/csproj-ignore-service";

export default class SyncFolderOperation {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * Sync a the project with the indicated files.
   *  This will add any files on disk that are not in the project to the project,
   *  and remove any files that are in the project but not on disk.
   * @param folder - the folder to sync
   */
  public async syncProjectFiles(files: Uri[]): Promise<void> {
    try {
      const csprojService = new CsprojService(true);
      const ignoreService = new CsprojIgnoreService();
      await this.recursiveSync(files, csprojService, ignoreService);
      csprojService.flush();
    } catch (error) {
      logger.error(`Unexpected error while syncing files ${error}`);
      throw error;
    }
  }

  // ========================================================
  // private methods
  // ========================================================

  /**
   * Sync the csproj with the given files recursively
   * @param files - the files to sync
   * @param csprojService - the csproj service to use
   * @param ignoreService - the ignore service to use
   */
  private async recursiveSync(
    files: Uri[],
    csprojService: CsprojService,
    ignoreService: CsprojIgnoreService,
  ): Promise<void> {
    for (const file of files) {
      const fileType = (await vscode.workspace.fs.stat(file)).type;

      if (fileType === FileType.File) {
        if (!(await ignoreService.isFileIgnored(file.fsPath))) {
          await csprojService.addFileToCsproj(file.fsPath);
        }
      } else if (fileType === FileType.Directory) {
        const dirFiles = await vscode.workspace.fs.readDirectory(file);

        await this.recursiveSync(
          dirFiles.map((fl) => vscode.Uri.file(path.join(file.fsPath, fl[0]))),
          csprojService,
          ignoreService,
        );

        // remove any files from the csproj that are not in the directory
        const csprojPath = await csprojService.findNearestCsproj(file.fsPath);
        if (csprojPath) {
          const csprojMeta = await csprojService.readCsproj(csprojPath);

          for (const include of csprojMeta.includes) {
            const includePath = path.normalize(
              path.resolve(path.dirname(csprojPath), include.include),
            );

            if (
              path.dirname(includePath) === file.fsPath &&
              !dirFiles.some((fl) => fl[0] === path.basename(include.include))
            ) {
              await csprojService.removeFileFromCsproj(
                path.join(path.dirname(file.fsPath), include.include),
              );
            }
          }
        }
      }
    }
  }
}
