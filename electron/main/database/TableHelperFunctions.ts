import { DBEntry, DBQueryResult, DatabaseFields } from "./Schema";
import * as fs from "fs";
import {
  GetFilesInfoList,
  flattenFileInfoTree,
  readFile,
} from "../Files/Filesystem";
import { FileInfo, FileInfoTree } from "../Files/Types";
import { chunkMarkdownByHeadingsAndByCharsIfBig } from "../RAG/Chunking";
import { LanceDBTableWrapper } from "./LanceTableWrapper";
import { errorToString } from "../Generic/error";

export const RepopulateTableWithMissingItems = async (
  table: LanceDBTableWrapper,
  directoryPath: string,
  onProgress?: (progress: number) => void
) => {
  let filesInfoTree;
  console.log("getting files info list");
  try {
    filesInfoTree = GetFilesInfoList(directoryPath);
  } catch (error) {
    throw new Error(`Error getting file info list: ${errorToString(error)}`);
  }

  console.time("STARTING TO COMPUTE ITEMS");

  const fileInfoestimatedSize = estimateMemoryUsageInMB(filesInfoTree);
  console.log("file info estimated size:", fileInfoestimatedSize);
  let tableArray;
  try {
    tableArray = await getTableAsArray(table);
  } catch (error) {
    throw new Error(`Error converting table to array: ${errorToString(error)}`);
  }
  const estimatedSize = estimateMemoryUsageInMB(tableArray);
  console.log("estimated size of table:", estimatedSize);
  let itemsToRemove;
  try {
    itemsToRemove = await computeDBItemsToRemoveFromTable(
      filesInfoTree,
      tableArray
    );
  } catch (error) {
    throw new Error(
      `Error computing items to remove from table: ${errorToString(error)}`
    );
  }

  const filePathsToRemove = itemsToRemove.map((x) => x.notepath);
  try {
    await table.deleteDBItemsByFilePaths(filePathsToRemove);
  } catch (error) {
    throw new Error(
      `Error deleting items by file paths: ${errorToString(error)}`
    );
  }

  let dbItemsToAdd;
  try {
    dbItemsToAdd = await computeDbItemsToAddOrUpdate(filesInfoTree, tableArray);
  } catch (error) {
    throw new Error(`Error computing DB items to add: ${errorToString(error)}`);
  }
  console.timeEnd("STARTING TO COMPUTE ITEMS");

  if (dbItemsToAdd.length === 0) {
    onProgress && onProgress(1);
    return;
  }

  const filePathsToDelete = dbItemsToAdd.map((x) => x[0].notepath);
  try {
    await table.deleteDBItemsByFilePaths(filePathsToDelete);
  } catch (error) {
    throw new Error(
      `Error deleting DB items by file paths: ${errorToString(error)}`
    );
  }

  const flattenedItemsToAdd = dbItemsToAdd.flat();
  try {
    await table.add(flattenedItemsToAdd, onProgress);
  } catch (error) {
    throw new Error(`Error adding items to table: ${errorToString(error)}`);
  }

  onProgress && onProgress(1);
};

function estimateMemoryUsageInMB(object: any): number {
  const jsonString = JSON.stringify(object);
  const sizeInBytes = new Blob([jsonString]).size;
  return sizeInBytes / (1024 * 1024); // Convert bytes to megabytes
}

// const getTableAsArray = async (
//   table: LanceDBTableWrapper
// ): Promise<DBEntry[]> => {
//   const totalRows = await table.countRows();
//   if (totalRows == 0) {
//     return [];
//   }
//   const nonEmptyResults = await table.filter(
//     `${DatabaseFields.CONTENT} != ''`,
//     totalRows
//   );
//   const emptyResults = await table.filter(
//     `${DatabaseFields.CONTENT} = ''`,
//     totalRows
//   );
//   const results = nonEmptyResults.concat(emptyResults);

//   return results;
// };

const getTableAsArray = async (
  table: LanceDBTableWrapper
): Promise<{ notepath: string; filemodified: Date }[]> => {
  const nonEmptyResults = await table.lanceTable
    .filter(`${DatabaseFields.NOTE_PATH} != ''`)
    .select([DatabaseFields.NOTE_PATH, DatabaseFields.FILE_MODIFIED])
    .execute();

  const mapped = nonEmptyResults.map(convertLanceEntryToLightDBEntry);

  return mapped as { notepath: string; filemodified: Date }[];
};

const computeDbItemsToAddOrUpdate = async (
  filesInfoList: FileInfo[],
  tableArray: { notepath: string; filemodified: Date }[]
): Promise<DBEntry[][]> => {
  const filesAsChunks = await convertFileInfoListToDBItems(filesInfoList);

  const fileChunksMissingFromTable = filesAsChunks.filter(
    (chunksBelongingToFile) =>
      areChunksMissingFromTable(chunksBelongingToFile, tableArray)
  );

  return fileChunksMissingFromTable;
};

const convertFileInfoListToDBItems = async (
  filesInfoList: FileInfo[]
): Promise<DBEntry[][]> => {
  const promises = filesInfoList.map(convertFileTypeToDBType);
  const filesAsChunksToAddToDB = await Promise.all(promises);
  return filesAsChunksToAddToDB;
};

const computeDBItemsToRemoveFromTable = async (
  filesInfoList: FileInfo[],
  tableArray: { notepath: string; filemodified: Date }[]
): Promise<{ notepath: string; filemodified: Date }[]> => {
  const itemsInTableAndNotInFilesInfoList = tableArray.filter(
    (item) => !filesInfoList.some((file) => file.path == item.notepath)
  );
  return itemsInTableAndNotInFilesInfoList;
};

const areChunksMissingFromTable = (
  chunksToCheck: DBEntry[],
  tableArray: { notepath: string; filemodified: Date }[]
): boolean => {
  // checking whether th
  if (chunksToCheck.length == 0) {
    // if there are no chunks and we are checking whether the table
    return false;
  }

  if (chunksToCheck[0].content === "") {
    return false;
  }
  // then we'd check if the filepaths are not present in the table at all:
  const notepath = chunksToCheck[0].notepath;
  const itemsAlreadyInTable = tableArray.filter(
    (item) => item.notepath == notepath
  );
  if (itemsAlreadyInTable.length == 0) {
    // if we find no items in the table with the same notepath, then we should add the chunks to the table
    return true;
  }

  return chunksToCheck[0].filemodified > itemsAlreadyInTable[0].filemodified;
};

const convertFileTreeToDBEntries = async (
  tree: FileInfoTree
): Promise<DBEntry[]> => {
  const flattened = flattenFileInfoTree(tree);

  const promises = flattened.map(convertFileTypeToDBType);

  const entries = await Promise.all(promises);

  return entries.flat();
};

const convertFileTypeToDBType = async (file: FileInfo): Promise<DBEntry[]> => {
  const fileContent = readFile(file.path);
  const chunks = await chunkMarkdownByHeadingsAndByCharsIfBig(fileContent);
  const entries = chunks.map((content, index) => {
    return {
      notepath: file.path,
      content: content,
      subnoteindex: index,
      timeadded: new Date(),
      filemodified: file.dateModified,
      filecreated: file.dateCreated,
    };
  });
  return entries;
};

export function sanitizePathForDatabase(filePath: string): string {
  return filePath.replace(/'/g, "''");
}

export function unsanitizePathForFileSystem(dbPath: string): string {
  return dbPath.replace(/''/g, "'");
}

export const addFileTreeToDBTable = async (
  dbTable: LanceDBTableWrapper,
  fileTree: FileInfoTree
): Promise<void> => {
  const dbEntries = await convertFileTreeToDBEntries(fileTree);
  await dbTable.add(dbEntries);
};

export const removeFileTreeFromDBTable = async (
  dbTable: LanceDBTableWrapper,
  fileTree: FileInfoTree
): Promise<void> => {
  const flattened = flattenFileInfoTree(fileTree);
  const filePaths = flattened.map((x) => x.path);
  await dbTable.deleteDBItemsByFilePaths(filePaths);
};

export const updateFileInTable = async (
  dbTable: LanceDBTableWrapper,
  filePath: string
): Promise<void> => {
  await dbTable.deleteDBItemsByFilePaths([filePath]);
  const content = readFile(filePath);
  const chunkedContentList = await chunkMarkdownByHeadingsAndByCharsIfBig(
    content
  );
  const stats = fs.statSync(filePath);
  const dbEntries = chunkedContentList.map((content, index) => {
    return {
      notepath: filePath,
      content: content,
      subnoteindex: index,
      timeadded: new Date(), // time now
      filemodified: stats.mtime,
      filecreated: stats.birthtime,
    };
  });
  await dbTable.add(dbEntries);
};

function hasRequiredFields(
  record: Record<string, unknown>,
  requiredFields: string[]
): boolean {
  return requiredFields.every((field) => field in record);
}

export function convertLanceEntryToDBEntry(
  record: Record<string, unknown>
): DBEntry | null {
  // Define the required fields based on your DatabaseFields enum/constants
  const requiredFieldsForDBEntry = [
    DatabaseFields.NOTE_PATH,
    DatabaseFields.VECTOR,
    DatabaseFields.CONTENT,
    DatabaseFields.SUB_NOTE_INDEX,
    DatabaseFields.TIME_ADDED,
  ];

  if (hasRequiredFields(record, requiredFieldsForDBEntry)) {
    const recordAsDBQueryType = record as unknown as DBEntry;
    recordAsDBQueryType.notepath = unsanitizePathForFileSystem(
      recordAsDBQueryType.notepath
    );
    return recordAsDBQueryType;
  }
  return null;
}

export function convertLanceEntryToLightDBEntry(
  record: Record<string, unknown>
): { notepath: string; filemodified: Date } | null {
  if (DatabaseFields.NOTE_PATH in record) {
    const recordAsDBQueryType = record as unknown as {
      notepath: string;
      filemodified: Date;
    };
    recordAsDBQueryType.notepath = unsanitizePathForFileSystem(
      recordAsDBQueryType.notepath
    );
    return recordAsDBQueryType;
  }
  return null;
}

export function convertLanceResultToDBResult(
  record: Record<string, unknown>
): DBQueryResult | null {
  if (
    DatabaseFields.NOTE_PATH in record &&
    DatabaseFields.VECTOR in record &&
    DatabaseFields.CONTENT in record &&
    DatabaseFields.SUB_NOTE_INDEX in record &&
    DatabaseFields.TIME_ADDED in record &&
    DatabaseFields.DISTANCE in record
  ) {
    const recordAsDBQueryType = record as unknown as DBQueryResult;
    recordAsDBQueryType.notepath = unsanitizePathForFileSystem(
      recordAsDBQueryType.notepath
    );
    return recordAsDBQueryType;
  }
  return null;
}
