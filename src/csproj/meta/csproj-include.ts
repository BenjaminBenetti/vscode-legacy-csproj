import { CsprojIncludeType } from "./csproj-include-type";

export default class CsprojInclude {
  // ========================================================
  // public methods
  // ========================================================

  public constructor(
    private readonly _include: string,
    private readonly _type: CsprojIncludeType,
  ) {}

  // ========================================================
  // getters
  // ========================================================

  public get include(): string {
    return this._include;
  }

  public get type(): CsprojIncludeType {
    return this._type;
  }
}
