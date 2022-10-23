const initApi = require('../../util/api');

class CrawlController {
    //  [GET] /crawl
    async crawl(req, res, next) {
        const source = req.query.source;
        console.log('Nguon ' + source);

        initApi({ source });
        console.log('Da goi den api');

        res.render('crawl', {
            source: source,
        });
    }
}

module.exports = new CrawlController();
