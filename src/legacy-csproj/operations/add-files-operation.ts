import path from "path";
import CsprojService from "../../csproj/csproj-service";
import { logger } from "../../logger";
import vscode, { Uri } from "vscode";
import CsprojIgnoreService from "../../ignore/csproj-ignore-service";

export default class AddFilesOperation {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * Add one or more files or folders to the project.
   * @param files - the files to add
   */
  public async addFilesToProject(files: readonly Uri[]): Promise<void> {
    try {
      const csprojService = new CsprojService(true);
      const ignoreService = new CsprojIgnoreService();
      await this.recursiveAddFiles(files, csprojService, ignoreService);
      csprojService.flush();
    } catch (error) {
      logger.error(`Unexpected error while adding files ${error}`);
      throw error;
    }
  }

  // ========================================================
  // private methods
  // ========================================================

  /**
   * recursively add the given files to the csproj
   * @param files - the files to add
   * @param csprojService - the csproj service to use
   * @param ignoreService - the ignore service to use
   */
  private async recursiveAddFiles(
    files: readonly vscode.Uri[],
    csprojService: CsprojService,
    ignoreService: CsprojIgnoreService,
  ) {
    for (const file of files) {
      if (await ignoreService.isFileIgnored(file.fsPath)) {
        logger.info(`Ignoring add of ${file.fsPath}`);
        continue;
      }

      switch ((await vscode.workspace.fs.stat(file)).type) {
        case vscode.FileType.File:
          await csprojService.addFileToCsproj(file.fsPath);
          break;
        case vscode.FileType.Directory:
          await this.recursiveAddFiles(
            (await vscode.workspace.fs.readDirectory(file)).map((fl) =>
              vscode.Uri.file(path.join(file.fsPath, fl[0])),
            ),
            csprojService,
            ignoreService,
          );
          break;
      }
    }
  }
}
