var router = require('express-promise-router')();
const crawlController = require('../app/controllers/CrawlController');
const path = require('path');

router.get('/', crawlController.crawl);
// dowload file
router.get('/dowload/:file', function (req, res, next) {
    const filePath = path.join(__dirname, `../public/crawl_data/${req.params.file}`);
    res.download(`${filePath}`);
});

module.exports = router;
