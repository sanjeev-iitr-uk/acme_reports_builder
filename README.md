# Acme Report Builder

this app is build to generate summary and reports on the basis of data files ingested in system. following commands are available to use this app.

- npm run ingest 
- npm run summary 
- npm run generate_report
- npm run exit
- npm run test

All the above commands can be be configured in package.json script.


## Features

- The ingest command will read the file from the directory named- "input' and store it in json format for summary and report generation. if it caught any error in the file it will rollback the data.all the ingested files will be saved in files>ingestedFiles directory
- The summary command will log total units and gross sales for a particular category, year and month. this command will merge all the filtered data available and in case of duplicate sku's it will combine the numbers and in case of conflict in category of duplicate sku's it will use the category associated with highest number of sales in recent month of that file.
- The generate_report command will generate a CSV from the all ingested files. this csv file contains a detailed report sorted by SKU,Year,Month. all the generated reports will be saved in output folder.



## Tech

Dillinger uses a number of open source projects to work properly:

- [xlsx] - read and write xlsx files
- [yargs] - pass the command line arguments
- [notarealdb] - maintain the upload order of files
- [mime-types] - check if file is of type -.xlsx or .txt
- [chalk] - log the messages in different colors
- [csv-stringify] - generate csv files
- [jest] - for testing purpose



## Installation

I build this app on node 8.17.0. and it is working fine on this version

Install the dependencies and devDependencies and start the server. Please use branch - "main".

```sh
cd acme_reports_builder
npm i
all commands writen in package.json scripts. please add some files in input folder and then you can configure your commands in package.json.
```