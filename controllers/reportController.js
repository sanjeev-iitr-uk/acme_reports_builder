const path = require('path');
const {FileModel} = require('../models');
const { errorLogger, checkFilesExist } = require('../utils');

const INPUT_FILES_LOCATION = '../files/ingestedFiles';
const INGESTED_FILES_LOCATION = '../input';

const ALLOWED_FILES_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain; charset=utf-8',
  ];

const reportController = (args) => {
    const filesInSystem = checkFilesExist();
    const filePath = path.join(__dirname, INGESTED_FILES_LOCATION, args.filename);
    const fileInstance = new FileModel(filePath, INGESTED_FILES_LOCATION)
    fileInstance.getJSONData();
    if (!ALLOWED_FILES_TYPES.includes(fileInstance.fileType)) {
       errorLogger({message: 'Error: Only .xlsx & .txt files accepted !'});
    }
    fileInstance.generateCSVFile();
}
module.exports = {
	reportController
}