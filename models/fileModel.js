'use-strict';
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');
const chalk = require('chalk');
const mime = require('mime-types');
const { validateFileValues, deleteFile, errorLogger, mergeSKUs, sortData } = require('../utils');
const { createObject, deleteObject } = require('../db');

class FileModel {

  constructor(filePath, filesLocation, fileName, fileData) {
    this.filePath = filePath;
    this.filesLocation = filesLocation;
    this.fileType = mime.contentType(path.extname(filePath));
    this.fileName = fileName || path.basename(filePath).split('.')[0];
    this.fileData = fileData || undefined;
  }

  getJSONData() {
    const workBook = xlsx.readFile(this.filePath);
    this.fileData = xlsx.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames]);
  }

  ingestFile(isFileAlreadyExist) {
    validateFileValues(this.fileData);

    if (isFileAlreadyExist) {
      deleteFile(this.fileName);
      deleteObject(this.fileName);
    }

    try {
      this.fileData = mergeSKUs(this.fileData);
      const fileLocation = path.join(__dirname, this.filesLocation);
      createObject({id: this.fileName, uploadOrder: Date.now()});
      fs.writeFileSync(`${fileLocation}/${this.fileName}.json`, JSON.stringify(this.fileData), 'utf-8');
    } catch (error) {
      errorLogger({message: error});
    }

    console.log(chalk.green(`File - ${this.fileName} Uploaded Successfully !`));
  }
}

module.exports = FileModel;
