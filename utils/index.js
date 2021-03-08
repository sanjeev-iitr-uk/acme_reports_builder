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
const deleteFile = (fileName, error) => {
  if (error) {
    console.log(chalk.yellow('Rolling-back any changes...'));
  } else {
    console.log(chalk.yellow('Removing duplicate files...'));
  }
  const filesLocation =  path.join(__dirname, INGESTED_FILES_LOCATION);
  fs.readdirSync(filesLocation).forEach(file => {
    if (file === `${fileName}.json`) {
      fs.unlinkSync(path.join(filesLocation, file));
    }
  });
};



const errorLogger = error => {
  console.log(chalk.red(error.message));
  process.exit(0);
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
  const output = items.map(file => {
  	return {fileName: file, data: JSON.parse(fs.readFileSync(`${filesLocation}/${file}`, 'utf8'))};
  });
  const data = output.filter((item) => item);
  return data;
};
const getCategoryHighestSales = (data) => {
  if (!data.length) {return ''}
  const item = data[0];
  let maxDate = new Date(1800, 1, 0);
  let maxKey = '';
  let category = '';
  let grossSale = 0;
  Object.keys(item).forEach(key => {
    if (key !== 'SKU' && key !== 'Section') {
      const [year, restKeyValue] = key.split('-');
      const [month] = restKeyValue.split(' ');
      const thisDate = new Date(year, month, 0);
      if (thisDate > maxDate) {
        maxDate = thisDate
        maxKey = `${year}-${month} Gross Sales`;
      }
    }
  })
  data.forEach(item => {
    if (item[maxKey] > grossSale){
      grossSale = item[maxKey]
      category = item.Section
    }
  })
  return category;
}
const mergeSKUs = (data) => {
  const maxSalesCategory = getCategoryHighestSales(data);
  const skuMap = {}
  data.forEach((item) => {
      if(skuMap[item.SKU]){
          var oldObject = skuMap[item.SKU]
          Object.keys(item).forEach(key => {
              if (key !== 'SKU' && key !== 'Section'){
                  oldObject[key] += item[key]
              }
          })
          if(oldObject.Section !== item.Section){
            oldObject.Section = maxSalesCategory;
            oldObject.hasCategoryChanged = true;
          }
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
