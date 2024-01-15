import path from "path";
import { CsprojIncludeType } from "./csproj-include-type";

export default class CsprojIncludeTypeService {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * Get the appropriate include type for the given file
   * @param filePath - the path to the file
   * @returns - the include type
   */
  public getIncludeTypeForFile(filePath: string): CsprojIncludeType {
    switch (path.extname(filePath)) {
      case ".cs":
        return CsprojIncludeType.Compile;
      default:
        return CsprojIncludeType.Content;
    }
  }
}
