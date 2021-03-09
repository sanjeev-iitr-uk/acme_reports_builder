'use strict';
const yargs = require('yargs');
const {ingestFileController, summaryController, reportController} = require('./controllers');


// ingest command handler
yargs.command({
    command: 'ingest',
    describe: 'ingest data files into system',
    builder: {
        filename: {
            describe: 'xlsx or txt filename',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv) {
        ingestFileController(argv);
    }
})

// summary command handler
yargs.command({
    command: 'summary',
    describe: 'Get summary of a category for a particular year and month',
    builder: {
        category: {
            describe: 'Category for the filter',
            demandOption: true,
            type: 'string'
        },
        year: {
            describe: 'Year for the filter',
            demandOption: true,
            type: 'number'
        },
        month: {
            describe: 'Month for the filter',
            demandOption: true,
            type: 'number'
        }
    },
    handler(argv) {
        summaryController(argv);
    }
})
// generate_report command handler
yargs.command({
    command: 'generate_report',
    describe: 'Get a detailed report for a file',
    builder: {
        filename: {
            describe: 'file to generate report',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv) {
        reportController(argv);
    }
})
// exit command handler
yargs.command({
    command: 'exit',
    describe: 'Exit the program',
    handler(argv) {
        process.exit(0);
    }
})

yargs.parse()