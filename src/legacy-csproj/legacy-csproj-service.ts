import { Uri } from "vscode";
import AddFilesOperation from "./operations/add-files-operation";
import RemoveFilesOperation from "./operations/remove-files-operation";
import RenameFilesOperation, {
  RenameFile,
} from "./operations/rename-files-operation";

export default class LegacyCsprojService {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * Add one or more files or folders to the project.
   * @param files - the files to add
   */
  public async addFilesToProject(files: readonly Uri[]): Promise<void> {
    await new AddFilesOperation().addFilesToProject(files);
  }

  /**
   * remove one or more files or folders from the project.
   * @param files - the files to remove
   */
  public async removeFilesFromProject(files: readonly Uri[]): Promise<void> {
    await new RemoveFilesOperation().removeFilesFromProject(files);
  }

  /**
   * Rename the given files and directories in the project
   * @param files - the files and directories to rename.
   */
  public async renameProjectFiles(files: readonly RenameFile[]): Promise<void> {
    await new RenameFilesOperation().renameProjectFiles(files);
  }
}
