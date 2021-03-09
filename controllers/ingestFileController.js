const path = require('path');
const {FileModel} = require('../models');
const { deleteFile, errorLogger, isFileExist } = require('../utils');


const INPUT_FILES_LOCATION = '../input';
const INGESTED_FILES_LOCATION = '../files/ingestedFiles';
const ALLOWED_FILES_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain; charset=utf-8',
];

const ingestFileController = (argv) => {
	try {
    const filePath = path.join(__dirname, INPUT_FILES_LOCATION, argv.filename);
    const fileInstance = new FileModel(filePath, INGESTED_FILES_LOCATION)
    fileInstance.getJSONData();

    if (!ALLOWED_FILES_TYPES.includes(fileInstance.fileType)) {
      errorLogger({message: 'Error: Only .xlsx & .txt files accepted !'});
    }

    const isFileAlreadyExist = isFileExist(fileInstance.fileName);

    fileInstance.ingestFile(isFileAlreadyExist);
  } catch (error) {
  	const isFileAlreadyExist = isFileExist(argv.fileName);
    if (isFileAlreadyExist && error.code !== 'ENOENT') {
      deleteFile(argv.fileName, error);
    }

    errorLogger({message: error});
  }
}
module.exports = {
	ingestFileController
}