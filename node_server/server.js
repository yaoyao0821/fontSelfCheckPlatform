const cors = require('cors');
const express = require('express');
const font_route = require('./routes/font');
const login_router = require('./routes/login');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../webpack.config.js');
const path = require('path');
const compiler = webpack(webpackConfig);
const config = require('../config');
require('dotenv').config();

const hostname = process.env.HOST || config.server.host;
const port = process.env.PORT || config.server.port;

const app = express();

app.use(function (req, res, next) {
    let timestamp = new Date ();
    console.info(timestamp.toLocaleString() +": "+ req.protocol + '://' + req.get('host') + req.originalUrl);
    next();
});
app.use(cors());
app.use(login_router);
app.use(font_route);
app.disable('view cache');

app.disable('etag');
app.use(express.static(path.join(__dirname, '../public')));



app.listen(port, hostname, () => {
    console.log(`app listening at http://${hostname}:${port}/`)
})