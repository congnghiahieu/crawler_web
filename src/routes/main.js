const homeRouter = require('./home');
const crawlRouter = require('./crawl');

function route(app) {
    // All routes
    app.use('/', homeRouter);
    app.use('/crawling', crawlRouter);
}

module.exports = route;
