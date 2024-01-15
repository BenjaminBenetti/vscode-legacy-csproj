import CsprojInclude from "./csproj-include";

export default class CsprojMeta {
  // ========================================================
  // public methods
  // ========================================================

  public constructor(
    private readonly _toolVersion: string,
    private readonly _sdk: string,
    private readonly _targetFramework: string,
    private readonly _includes: CsprojInclude[],
  ) {}

  // ========================================================
  // getters
  // ========================================================

  public get toolVersion(): string {
    return this._toolVersion;
  }

  public get sdk(): string {
    return this._sdk;
  }

  public get targetFramework(): string {
    return this._targetFramework;
  }

  public get includes(): CsprojInclude[] {
    return this._includes;
  }
}
