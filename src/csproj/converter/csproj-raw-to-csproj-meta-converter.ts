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
    const projectTag = csproj.find((item: any) => !!(item as any).Project);
    return new CsprojMeta(
      projectTag[":@"]["@_ToolsVersion"],
      projectTag[":@"]["@_Sdk"] ?? null,
      this.getTargetFrameworkVersion(csproj),
      new CsprojRawToIncludesConverter().convert(csproj),
    );
  }

  // ========================================================
  // private methods
  // ========================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getTargetFrameworkVersion(csproj: any): string {
    const projectTag = csproj.find((item: any) => !!(item as any).Project);

    for (const propertyGroup of projectTag.Project.filter(
      (item: any) => !!item.PropertyGroup,
    )) {
      const targetFrameworkTag = propertyGroup.PropertyGroup.find(
        (item: any) => !!item.TargetFrameworkVersion,
      );

      if (targetFrameworkTag) {
        return targetFrameworkTag.TargetFrameworkVersion[0]["#text"];
      }
    }
    return "";
  }
}
