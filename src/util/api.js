const express = require('express');
const apiPort = process.env.port || process.env.PORT || 5001;
const api = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { run, getFileName } = require('./crawler');

// encode UTF-8
api.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
// json
api.use(bodyParser.json());
// config cors policy
api.use(
    cors({
        origin: /http:\/\/localhost/,
    })
);
api.options('*', cors());

api.listen(apiPort, () => {
    console.log(`API gateway is ready on ${apiPort}`);
});

async function initApi({ source }) {
    api.get('/', async function (req, res) {
        const data = await run(source);
        res.json({
            articles: data,
            fileName: getFileName(),
        });
    });
}

module.exports = initApi;
