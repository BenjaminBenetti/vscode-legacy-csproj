export default interface IgnoreService {
  isFileIgnored(filePath: string): Promise<boolean>;
}
