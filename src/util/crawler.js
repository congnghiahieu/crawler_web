const cheerio = require('cheerio');

const axios = require('axios');

const excel = require('exceljs');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const path = require('path');

let fileName = '';
let workbook;
let sheets;
let csvWriter;

function getFileName() {
    return fileName;
}

async function initExcel() {
    workbook = new excel.Workbook();
    sheets = workbook.addWorksheet("Crawled Data");

    sheets.columns = [
        { header: "Số thứ tự", key: "id" },
        { header: "Tên báo", key: "title", width: 100 },
        { header: "Tác giả", key: "authors" },
        { header: "Ngày xuất bản", key: "releaseDate" },
        { header: "Tên số báo", key: "collection" },
    ];
}

async function initCsv(fileName) {
    csvWriter = createCsvWriter({
        path: path.join(__dirname, `../public/crawl_data/${fileName}.csv`),
        header: [
          {id: 'id', title: 'Số thứ tự'},
          {id: 'title', title: 'Tên báo'},
          {id: 'authors', title: 'Tác giả'},
          {id: 'releaseDate', title: 'Ngày xuất bản'},
          {id: 'collection', title: 'Tên số báo'},
        ],
    });
}

async function addDataToSheet(data) {
    await sheets.addRow(data);
}

async function fetchData(sourceURL) {
    let response = await axios(sourceURL).catch((err) => console.log(err));

    if (response?.status != 200) {
        console.log("Error occurred while fetching data from " + sourceURL);
        return;
    }
    return response.data;
}

async function getArticlesInfo(sourceURL, data) {
    let id = 0;

    const mainPage = cheerio.load(await fetchData(sourceURL));

    const random = Math.ceil(Math.random() * 1000);
    fileName = mainPage('title').text().trim().replace(/\t/g,'').replace(/\n/g,'').split('|')[1].trim().replace(/\s+/g,'_') + "_" + random;
    console.log(fileName);

    const collectionLinks = mainPage('.issue-summary.media .media-body .title').map((i,el) => {
        return mainPage(el).attr('href');
    }).toArray();

    console.log(collectionLinks);

    const collectionPages = await Promise.all(collectionLinks.map(
        (collectionLink) => fetchData(collectionLink).then((responseData) => cheerio.load(responseData))
    ));

    for (let collectionPage of collectionPages) {

        const articleLinks = collectionPage('.article-summary.media .media-body').map((i,el) => {
            return collectionPage(el).find('a').attr('href');
        }).toArray();

        const htmls = await Promise.all(articleLinks.map(
            (articleLink) => fetchData(articleLink).then((responseData) => cheerio.load(responseData))
        ));

        for (let html of htmls) {
            // Get name
            let authors = [];
            html('meta[name="citation_author"]').each((idx,el) => {
                const author = html(el).prop('content');
                authors.push(author);
            })
            // Get title
            let title = html('meta[name="citation_title"]').prop('content').trim();
            // Get release date
            let releaseDate = html('meta[name="citation_date"]').prop('content');
            // Get collection
            let collectionName = html('.panel.panel-default.issue .panel-body a').text().trim();

            let articleInfo = {
                'id': ++id,
                'title':title,
                'authors': authors.join(', '),
                'releaseDate': releaseDate,
                'collection': collectionName,
            };

            // Write to excel sheet
            await addDataToSheet(articleInfo);
            // write to csv
            data.push(articleInfo);
            console.log(articleInfo);
        }
    }
}

async function run(sourceURL) {
    let data = [];
    await initExcel();
    
    console.time('Crawl time');
    await getArticlesInfo(sourceURL, data);
    console.timeEnd('Crawl time');
    console.log(data.length);
    await initCsv(fileName);
    // Write to CSV
    csvWriter.writeRecords(data).then(()=> console.log('The CSV file was written successfully'));
    // Write to excel workbook
    await workbook.xlsx.writeFile(path.join(__dirname, `../public/crawl_data/${fileName}.xlsx`));

    return data;
}

module.exports = {
    run,
    getFileName,
};