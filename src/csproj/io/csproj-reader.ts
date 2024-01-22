import { Uri, workspace } from "vscode";
import CsprojMeta from "../meta/csproj-meta";
import { XMLParser } from "fast-xml-parser";
import CsprojRawToCsprojMetaConverter from "../converter/csproj-raw-to-csproj-meta-converter";
import { logger } from "../../logger";

export default class CsprojReader {
  private readonly CsprojReadRetry = 3;
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
      parseTagValue: false,
    });

    for (let i = 0; i < this.CsprojReadRetry; i++) {
      try {
        const csproj = xmlParser.parse(
          (await workspace.fs.readFile(Uri.file(csprojPath))).toString(),
        );

        if (csproj && csproj.length > 0) {
          return csproj;
        } else {
          throw new Error("Failed to read csproj");
        }
      } catch (error) {
        if (i === this.CsprojReadRetry - 1) {
          logger.error("To many failed attempts to read csproj");
          throw error;
        }
      }
    }
  }
}
