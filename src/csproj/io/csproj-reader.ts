import { Uri, workspace } from "vscode";
import CsprojMeta from "../meta/csproj-meta";
import { XMLParser } from "fast-xml-parser";
import CsprojRawToCsprojMetaConverter from "../converter/csproj-raw-to-csproj-meta-converter";

export default class CsprojReader {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * read the given csproj
   * @param csprojPath - the path to the csproj
   * @returns - the csproj metadata
   */
  public async readCsproj(csprojPath: string): Promise<CsprojMeta> {
    const csproj = await this.loadCsprojRaw(csprojPath);

    return new CsprojRawToCsprojMetaConverter().convert(csproj);
  }

  /**
   * Load the raw csproj xml from disk
   * @param csprojPath
   * @returns
   */
  public async loadCsprojRaw(csprojPath: string): Promise<any> {
    const xmlParser = new XMLParser({
      attributeNamePrefix: "@_",
      commentPropName: "#comment",
      ignoreAttributes: false,
      preserveOrder: true,
    });

    return xmlParser.parse(
      (await workspace.fs.readFile(Uri.file(csprojPath))).toString(),
    );
  }
}
