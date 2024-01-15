import { Converter } from "../../converter/converter";
import CsprojMeta from "../meta/csproj-meta";
import CsprojRawToIncludesConverter from "./csproj-raw-to-includes-converter";

export default class CsprojRawToCsprojMetaConverter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  implements Converter<any, CsprojMeta>
{
  // ========================================================
  // public methods
  // ========================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public convert(csproj: any): CsprojMeta {
    return new CsprojMeta(
      csproj.Project["@_ToolsVersion"],
      csproj.Project["@_Sdk"] ?? null,
      this.getTargetFrameworkVersion(csproj),
      new CsprojRawToIncludesConverter().convert(csproj),
    );
  }

  // ========================================================
  // private methods
  // ========================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getTargetFrameworkVersion(csproj: any): string {
    for (const propertyGroup of csproj.Project.PropertyGroup) {
      if (propertyGroup.TargetFrameworkVersion) {
        return propertyGroup.TargetFrameworkVersion;
      }
    }
    return "";
  }
}
