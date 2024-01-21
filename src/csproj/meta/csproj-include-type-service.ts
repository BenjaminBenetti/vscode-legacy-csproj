import path from "path";
import { CsprojIncludeType } from "./csproj-include-type";
import { workspace } from "vscode";
import { ConfigKey } from "../../config/config-key";
import { FileTagMapping } from "../../config/file-tag-mapping";

export default class CsprojIncludeTypeService {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * Get the appropriate include type for the given file
   * @param filePath - the path to the file
   * @returns - the include type
   */
  public getIncludeTypeForFile(filePath: string): CsprojIncludeType | string {
    const fileTagMappings = workspace
      .getConfiguration(ConfigKey.Extension)
      .get(ConfigKey.FileTagMappings) as FileTagMapping[];

    const mapping = fileTagMappings.find(
      (mapping) => mapping.extension === path.extname(filePath),
    );

    if (mapping) {
      return mapping.tag;
    } else {
      return CsprojIncludeType.Content;
    }
  }
}
