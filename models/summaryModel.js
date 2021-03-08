'use strict';

const { forIn } = require('lodash');
const { getIngestedFiles, errorLogger, mergeSKUs } = require('../utils');
const { getObject } = require('../db');
const chalk = require('chalk');


class SummaryModel {

  constructor(args = {}) {
    this.args = args;
  }

  generateSummary() {
    const data = getIngestedFiles();
    if (!data.length) {
      errorLogger({message: 'Data not available'});
    }
    // const SKUs = mergeSKUs(data);
    const summary = data.map(item=> {
      const categoryData = this.filterByCategory(item.data, this.args.category);
      const fileData = getObject(item.fileName.split('.')[0]);
      return {fileName: item.fileName, uploadOrder: fileData.uploadOrder, ...categoryData}
    });
    console.log(summary);
    summary.sort((a, b) => b.uploadOrder - a.uploadOrder);
    const result = summary.find((item) => item.units && item.sales)
    const output = `${this.args.category} - Total Units: ${result.units}, Total Gross Sales: ${parseInt(result.sales).toFixed(
      2
    )}`;
    console.log(chalk.blueBright(output));
  }
  filterByCategory(SKUs, category) {
    const filteredSKUs = SKUs.filter(sku => sku['Section'] === category);
    if (!filteredSKUs.length) {
      errorLogger({message: 'No Skus in this category !'});
    }
    return this.calculateSummary(filteredSKUs);
  }
  calculateSummary(filteredSKUs) {
    let totalUnits = 0;
    let totalGrossSales = 0;
    const yearAndMonth = `${this.args.year}-${this.args.month}`;
    filteredSKUs.forEach(sku => {
      forIn(sku, (value, key) => {
        if (key.includes(yearAndMonth)) {
          key.includes('Sales') ? (totalGrossSales += value) : (totalUnits += value);
        }
      });
    });
    if (!totalUnits || !totalGrossSales) {
      errorLogger({message: 'No Skus in this category !'});
    }
    return {units: totalUnits, sales: totalGrossSales};    
  }
}

module.exports = SummaryModel;
