'use strict';
const chalk = require('chalk');
const {forIn} = require('lodash');
const fs = require('fs');
const path = require('path');


const INGESTED_FILES_LOCATION = '../files/ingestedFiles';

const validateFileValues = fileData => {
  if (fileData.length) {
    fileData.forEach(section => {
      forIn(section, (value, key) => {
        const numToString = value.toString();

        // validate numerical values in files
        if (key !== 'Section' && !numToString.match(/^-?\d*(\.\d+)?$/)) {
          errorLogger({message: 'Error: Sales value in report is not a valid float'});
        }
      });
    });
  } else {
    errorLogger({message: 'Error: There was a problem ingesting the report'});
  }
};



// rollback and update file
const deleteFile = (filesLocation, fileName, error) => {
  if (error) {
    console.log(chalk.yellow('Rolling-back any changes...'));
  } else {
    console.lolog(chalk.yellow('Removing duplicate files...'));
  }

  fs.readdirSync(filesLocation).forEach(file => {
    if (file === `${fileName}.json`) {
      fs.unlinkSync(path.join(filesLocation, file));
    }
  });
};



const errorLogger = error => {
  console.log(chalk.red(error.message));
  process.exit();
};

const isFileExist = (fileName) => {
  const location = path.join(__dirname, INGESTED_FILES_LOCATION, `${fileName}.json`);
	return fs.existsSync(location);
}

const checkFilesExist = () => {
    const location = path.join(__dirname, INGESTED_FILES_LOCATION);
    const files = fs.readdirSync(location);
    return files.length;
}
const getIngestedFiles = () => {
  const filesLocation = path.join(__dirname, INGESTED_FILES_LOCATION);
  const items = fs.readdirSync(filesLocation);
  let output = [];
  items.forEach(file => {
  	const items = JSON.parse(fs.readFileSync(`${filesLocation}/${file}`, 'utf8'));
    output = [...output, ...items];
  });
  const data = output.filter((item) => item);
  return data;
};
const mergeSKUs = (data) => {
  const skuMap = {}
  data.forEach((item) => {
      if(skuMap[item.SKU]){
          var oldObject = skuMap[item.SKU]
          Object.keys(item).forEach(key => {
              if (key !== 'SKU' && key !== 'Section'){
                  oldObject[key] += item[key]
              }
          })
          skuMap[item.SKU] = oldObject
      } else {
          skuMap[item.SKU] = item
      }
  });
  const mergedSKUs = [];
  Object.keys(skuMap).forEach(key => mergedSKUs.push(skuMap[key]))
  return mergedSKUs;
}
const sortData = (data, key) => {
  return data.sort((a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0));
};

module.exports = {
  validateFileValues: validateFileValues,
  deleteFile: deleteFile,
  errorLogger: errorLogger,
  isFileExist: isFileExist,
  checkFilesExist: checkFilesExist,
  getIngestedFiles: getIngestedFiles,
  mergeSKUs: mergeSKUs,
  sortData: sortData
};
