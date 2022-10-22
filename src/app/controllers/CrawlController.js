const myCrawler = require('../../util/crawler');

class CrawlController {
    //  [GET] /crawl
    async crawl(req, res, next) {
        const source = req.query.source;

        const data = await myCrawler.run(source);

        res.render('crawl', {
            data: data,
            source: source,
            fileName: myCrawler.getFileName(),
        });
    }
}

module.exports = new CrawlController();
