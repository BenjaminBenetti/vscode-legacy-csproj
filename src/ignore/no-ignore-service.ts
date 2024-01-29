import IgnoreService from "./ignore-service";

export class NoIgnoreService implements IgnoreService {
  // ========================================================
  // public methods
  // ========================================================

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async isFileIgnored(_: string): Promise<boolean> {
    return false;
  }
}
