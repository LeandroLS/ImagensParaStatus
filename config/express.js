require('dotenv').config();
let compression = require('compression');
const express = require('express');
const path = require('./path');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('views', path.viewsPath);
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/../public/'));
function wwwRedirect(req, res, next) {
    return res.redirect(301, req.protocol + '://' + 'imagensparastatus.com.br' + req.originalUrl);
};

app.set('trust proxy', true);
app.use(wwwRedirect);
app.use(compression());
module.exports = app;