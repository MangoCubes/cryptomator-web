export interface StorageObject {
  key: string;
  size?: number;
  lastModified?: Date;
  data?: Uint8Array;
}

export interface StorageAdapter {
  list(prefix: string): Promise<StorageObject[]>;
  readFile(key: string): Promise<StorageObject>;
  readFileAsText(key: string): Promise<string>;
  createDirectory(path: string, dirId: string): Promise<void>;
  writeFile(path: string, contents: Uint8Array | Blob | string): Promise<void>;
  delete(path: string): Promise<void>;
  move(oldPath: string, newPath: string): Promise<void>;
}
