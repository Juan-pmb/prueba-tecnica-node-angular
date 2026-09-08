const fs = require('fs');
const csvParser = require('csv-parser');

const extractCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    let rowNumber = 1;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        rowNumber += 1;

        rows.push({
          rowNumber,
          data: row
        });
      })
      .on('end', () => {
        resolve(rows);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

module.exports = {
  extractCsv
};