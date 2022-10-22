var router = require('express-promise-router')();
// const crawlController = require('../app/controllers/CrawlController');
const path = require('path');
const myCrawler = require('../util/crawler');

router.get('/', async function (req, res, next) {
    const source = req.query.source;

    const data = await myCrawler.run(source);

    res.render('crawl', {
        data: data,
        source: source,
        fileName: myCrawler.getFileName(),
    });
});
// dowload file
router.get('/dowload/:file', function (req, res, next) {
    const filePath = path.join(__dirname, `../public/crawl_data/${req.params.file}`);
    res.download(`${filePath}`);
});

module.exports = router;
