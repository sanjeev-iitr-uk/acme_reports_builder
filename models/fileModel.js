'use-strict';
const {forIn} = require('lodash');
// const {throwError, deleteReport, sortReportData, combineSKUs} = require('../utils');

const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');
const chalk = require('chalk');
const mime = require('mime-types');
const stringify = require('csv-stringify');
const { validateFileValues, deleteFile, errorLogger, mergeSKUs, sortData } = require('../utils');


const OUPUT_FILES_LOCATION = '../output';

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
    }

    try {
      const fileLocation = path.join(__dirname, this.filesLocation);
      fs.writeFileSync(`${fileLocation}/${this.fileName}.json`, JSON.stringify(this.fileData), 'utf-8');
    } catch (error) {
      errorLogger({message: error});
    }

    console.log(chalk.green(`File - ${this.fileName} Uploaded Successfully !`));
  }

  generateCSVFile() {
    const input = [];
    const sortedData = sortData(mergeSKUs(this.fileData), 'Section');

    sortedData.forEach(item => {
      forIn(item, (_, key) => {
        let year;
        let month;

        if (key.includes('Sales')) {
          year = key.split('-')[0];
          month = key.split('-')[1].split(' ')[0];
        }

        if (year && month) {
          input.push([
            year,
            month,
            item['SKU'],
            item['Section'],
            item[`${year}-${month} Units`],
            item[`${year}-${month} Gross Sales`],
          ]);
        }
      });
    });

    this.outputCSV(input);
  }

  outputCSV(input) {
    stringify(
      input,
      {
        header: true,
        columns: {year: 'Year', month: 'Month', sku: 'SKU', category: 'Category', units: 'Units', sales: 'Gross Sales'},
      },
      (error, output) => {
        if (error) {
          errorLogger({message: error});
        }

        try {
          const outputFileLocation =  path.join(__dirname, OUPUT_FILES_LOCATION, `${this.fileName}.csv`);
          fs.writeFileSync(outputFileLocation, output);
        } catch (error) {
          errorLogger({message: error});
        }
      }
    );
  }
}

module.exports = FileModel;
