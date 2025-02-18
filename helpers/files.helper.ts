import * as fs from "fs";
import path from "path";

export const FilesHelper = {
  write: async (path: string, newContent: string) => {
    const filePath = _getFilePath(path);
    fs.writeFileSync(filePath, newContent);
  },

  read: async (path: string): Promise<string> => {
    const fsPromis = fs.promises;

    return await fsPromis.readFile(_getFilePath(path), "utf-8");
  },

  updateContent: async (path: string, content: string[]) => {
    if (content.length == 0) return;
    const filePath = _getFilePath(path);
    try {
      const existingData = [];

      const fsPromis = fs.promises;

      if (
        await fsPromis
          .access(filePath)
          .then(() => true)
          .catch(() => false)
      ) {
        const fileContent = await fsPromis.readFile(filePath, "utf-8");
        existingData.push(...(fileContent ? JSON.parse(fileContent) : []));
      }

      existingData.push(...content);
      await fsPromis.writeFile(filePath, JSON.stringify(existingData, null, 2));
    } catch (error) {
      console.error(error);
    }
  },

  cleanDir: async (dirPath?: string) => {
    const fullPath = _getFilePath(dirPath ?? "");
    fs.readdirSync(fullPath).forEach((file) => {
      const filePath = path.join(fullPath, file);
      if (fs.lstatSync(filePath).isFile()) {
        FilesHelper.deleteFile(filePath);
      }
    });
  },

  deleteFile: (path: string) => {
    fs.unlinkSync(path);
  },

  exists: (path: string): boolean => {
    return fs.existsSync(_getFilePath(path));
  },
};

const _getFilePath = (fileName: string): string => {
  const directoryPath = path.join(__dirname, "generated");
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
  if (fileName.includes(directoryPath)) return fileName;
  return `generated/${fileName}`;
};
