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
    if(!process.env.AMBIENTE == 'development'){
        if (req.headers.host.slice(0, 4) === 'www.') {
            var newHost = req.headers.host.slice(4);
            return res.redirect(301, 'https' + '://' + newHost + req.originalUrl);
        } else {
            return res.redirect(301, 'https' + '://' + 'imagensparastatus.com.br' + req.originalUrl);
        }
    }
    next();
};
app.set('trust proxy', true);
app.use(wwwRedirect);
app.use(compression());
module.exports = app;