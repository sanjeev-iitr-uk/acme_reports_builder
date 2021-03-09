'use strict';
const chalk = require('chalk');
const {forIn} = require('lodash');
const fs = require('fs');
const path = require('path');
const stringify = require('csv-stringify');


const OUPUT_FILES_LOCATION = '../output';
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


// common error logger
const errorLogger = error => {
  console.log(chalk.red(error.message));
  process.exit(0);
};

// check if a file exist in system
const isFileExist = (fileName) => {
  const location = path.join(__dirname, INGESTED_FILES_LOCATION, `${fileName}.json`);
	return fs.existsSync(location);
}

// check if files exist in system
const checkFilesExist = () => {
    const location = path.join(__dirname, INGESTED_FILES_LOCATION);
    const files = fs.readdirSync(location);
    return files.length;
}

// collect all ingested files
const getIngestedFiles = () => {
  const filesLocation = path.join(__dirname, INGESTED_FILES_LOCATION);
  const items = fs.readdirSync(filesLocation);
  const output = items.map(file => {
  	return {fileName: file, data: JSON.parse(fs.readFileSync(`${filesLocation}/${file}`, 'utf8'))};
  });
  const data = output.filter((item) => item);
  return data;
};

// highest sales category in a file
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

// merge duplicate skus and category
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
// generate csv file
const generateCSV = (data, filename) => {
  const skuDict = {}
  data.forEach(item => {
      if(skuDict[item.id]){
          const oldObject = skuDict[item.id]
          if(oldObject.uploadOrder <  item.uploadOrder) {
            skuMap[item.id] = item
          }
      } else {
          skuDict[item.id] = item
      }
  });
  const mergedEntries = [];
  Object.keys(skuDict).forEach(key => mergedEntries.push(skuDict[key]))
  const sortedData = sortData(mergedEntries, 'section');
  const input = [];
  sortedData.forEach(item => {
    input.push([
      item['year'],
      item['month'],
      item['sku'],
      item['section'],
      item['units'],
      item['sales'],
    ]);
  });
  outputCSV(input, filename);
}
// output csv  file
const outputCSV = (input, fileName) => {
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
        const outputFileLocation =  path.join(__dirname, OUPUT_FILES_LOCATION, `${fileName}.csv`);
        fs.writeFileSync(outputFileLocation, output);
        console.log(chalk.blueBright('file generated successfully !, please check output folder !'));
      } catch (error) {
        errorLogger({message: error});
      }
    }
  );
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
  sortData: sortData,
  generateCSV: generateCSV
};
