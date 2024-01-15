import { Uri, workspace } from "vscode";
import CsprojMeta from "../meta/csproj-meta";
import { XMLParser } from "fast-xml-parser";
import CsprojRawToCsprojMetaConverter from "../converter/csproj-raw-to-csproj-meta-converter";

export default class CsprojReader {
  // ========================================================
  // public methods
  // ========================================================

  public async readCsproj(csprojPath: string): Promise<CsprojMeta> {
    const rawCsproj = await workspace.fs.readFile(Uri.parse(csprojPath));
    const xmlParser = new XMLParser({
      parseAttributeValue: true,
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });

    const csproj = xmlParser.parse(rawCsproj.toString());

    return new CsprojRawToCsprojMetaConverter().convert(csproj);
  }
}
