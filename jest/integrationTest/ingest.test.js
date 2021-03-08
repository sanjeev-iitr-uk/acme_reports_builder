const path = require('path');
const {isFileExist, deleteFile} = require('../../utils');
const {FileModel} = require('../../models');

const TEST_FILES_LOCATION = '../../testFiles';
const filesLocation = '../files/ingestedFiles';
const file = 'test1.xlsx';

describe('Ingest', () => {
  describe('Testing --ingest command with filename as argument', () => {
    test('Test if a json data file is populated in ingested files', () => {
      const filePath = path.join(__dirname, TEST_FILES_LOCATION, file);
      const fileInstance = new FileModel(filePath, filesLocation);
      fileInstance.getJSONData();
      const fileName = fileInstance.fileName;
      const isFileAlreadyExists = isFileExist(fileName);

      if (isFileAlreadyExists) {
        deleteFile(fileName);
      }

      fileInstance.ingestFile(isFileAlreadyExists);
      expect(
        fileInstance && fileInstance.fileName && fileInstance.fileData && fileInstance.fileType
      ).toBeTruthy();
      expect(isFileExist(fileName)).toBeTruthy();
    });
  });
});
