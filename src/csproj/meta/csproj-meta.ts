import CsprojInclude from "./csproj-include";

export default class CsprojMeta {
  // ========================================================
  // public methods
  // ========================================================

  public constructor(
    private readonly _toolVersion: string,
    private readonly _sdk: string | null,
    private readonly _targetFramework: string,
    private readonly _includes: CsprojInclude[],
  ) {}

  /**
   * check if the csproj contains the given include
   * @param include - the include to look for
   * @returns - true / false if the include is found in the csproj
   */
  public containsInclude(include: CsprojInclude): boolean {
    return this._includes.some(
      (inc) => inc.include === include.include && inc.type === include.type,
    );
  }

  // ========================================================
  // getters
  // ========================================================

  public get toolVersion(): string {
    return this._toolVersion;
  }

  public get sdk(): string | null {
    return this._sdk;
  }

  public get targetFramework(): string {
    return this._targetFramework;
  }

  public get includes(): CsprojInclude[] {
    return this._includes;
  }
}
