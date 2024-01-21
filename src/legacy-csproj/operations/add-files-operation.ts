import path from "path";
import CsprojService from "../../csproj/csproj-service";
import { logger } from "../../logger";
import vscode, { Uri } from "vscode";

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
      await this.recursiveAddFiles(files, csprojService);
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
   */
  private async recursiveAddFiles(
    files: readonly vscode.Uri[],
    csprojService: CsprojService,
  ) {
    for (const file of files) {
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
          );
          break;
      }
    }
  }
}
