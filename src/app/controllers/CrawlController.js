const { run, getFileName } = require('../../util/crawler');

let URL = '';
class CrawlController {
    //  [GET] /crawl
    async crawl(req, res, next) {
        URL = req.query.source;

        res.render('crawl', {
            source: req.query.source,
        });
    }
    async result(req, res, next) {
        const data = await run(URL);

        res.json({
            articles: data,
            fileName: getFileName(),
        });
    }
}

module.exports = new CrawlController();
