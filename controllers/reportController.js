const path = require('path');
const { errorLogger, checkFilesExist, getIngestedFiles, generateCSV } = require('../utils');
const { getObject } = require('../db');

const reportController = (args) => {
    const filesInSystem = checkFilesExist();
    if(filesInSystem) {
      const data = getIngestedFiles();
      const mergedData = [];
      data.forEach(item => {
        const fileData = getObject(item.fileName.split('.')[0]);
        item.data.forEach(i => {
          const baseKey = `${i.SKU}-${i.Section}`;
          const keysData = {};
          Object.keys(i).forEach(key => {
            if(key !== 'SKU' && key !== 'Section') {
              const [year, restKeyValue] = key.split('-');
              const [month] = restKeyValue.split(' ');
              const tempKey = `${year}-${month}`;
              keysData[tempKey] = true
            }
          })
          Object.keys(keysData).forEach((k) => {
            const fullKey = `${baseKey}-${k}`;
            const year = k.split('-')[0];
            const month = k.split('-')[1];
            const masterObject = {};
            masterObject.id = fullKey;
            masterObject.uploadOrder = fileData.uploadOrder;
            const unitKey = `${k} Units`;
            const salesKey = `${k} Gross Sales`;
            masterObject.sales = i[salesKey];
            masterObject.units = i[unitKey];
            masterObject.sku = i['SKU'];
            masterObject.section = i['Section'];
            masterObject.year = parseInt(year);
            masterObject.month = parseInt(month);
            mergedData.push(masterObject);
          })
        })

      })
      generateCSV(mergedData, args.filename);
    }else {
      errorLogger({message: 'Error: No Files In System !'});
    }
}
module.exports = {
	reportController
}