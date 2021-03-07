'use strict';

const {forIn, isArray} = require('lodash');
const { getIngestedFiles, errorLogger, mergeSKUs } = require('../utils');

const chalk = require('chalk');


class SummaryModel {

  constructor(args = {}) {
    this.args = args;
  }

  // _errorIfEmpty(value) {
  //   value = isArray(value) ? value[0] : value;

  //   if (!value) {
  //     throwError({message: 'Data not available'});
  //   }
  // }

  generateSummary() {
    const data = getIngestedFiles();
    if (!data.length) {
      errorLogger({message: 'Data not available'});
    }
    const SKUs = mergeSKUs(data);
    return this.filterByCategory(SKUs, this.args.category);
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
    const output = `${this.args.category} - Total Units: ${totalUnits}, Total Gross Sales: ${totalGrossSales.toFixed(
      2
    )}`;
    console.log(chalk.blueBright(output));
    return output;
  }
}

module.exports = SummaryModel;
