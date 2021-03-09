const {SummaryModel} = require('../models');
const { errorLogger, checkFilesExist } = require('../utils');

const summaryController = (argv) => {
  const filesInSystem = checkFilesExist();

  if (filesInSystem) {
    const summaryInstance = new SummaryModel(argv);
    summaryInstance.generateSummary();
  } else {
    errorLogger({message: 'Data not available'});
  }
}
module.exports = {
	summaryController
}