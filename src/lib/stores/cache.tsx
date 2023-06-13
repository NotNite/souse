import { create } from "zustand";
import { fs, path } from "@tauri-apps/api";
import { cacheDir } from "@tauri-apps/api/path";

export type CacheStore = {
  cachedFiles: Record<string, Uint8Array>;
  readFile: (path: string) => Promise<Uint8Array>;
  writeFile: (path: string, content: Uint8Array) => Promise<void>;
  fileExists: (path: string) => Promise<boolean>;
};

export const useCacheStore = create<CacheStore>()((set, get) => {
  cacheDir()
    .then((d) => path.join(d, "souse"))
    .then(async (d) => {
      if (!(await fs.exists(d))) await fs.createDir(d);

      const avatars = await path.join(d, "avatars");
      if (!(await fs.exists(avatars))) await fs.createDir(avatars);
    });

  return {
    cachedFiles: {},
    readFile: async (filePath) => {
      const file = await path.join(await cacheDir(), "souse", filePath);
      const content = await fs.readBinaryFile(file);
      set((state) => ({
        cachedFiles: { ...state.cachedFiles, [filePath]: content }
      }));
      return content;
    },
    writeFile: async (filePath, content) => {
      const file = await path.join(await cacheDir(), "souse", filePath);
      await fs.writeBinaryFile(file, content);
    },
    fileExists: async (filePath) => {
      const cachedFiles = get().cachedFiles;
      return (
        cachedFiles[filePath] !== undefined ||
        (await fs.exists(await path.join(await cacheDir(), "souse", filePath)))
      );
    }
  };
});
