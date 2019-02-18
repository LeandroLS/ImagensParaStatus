const express = require('express');
const path = require('./path');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('views', path.viewsPath);
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/../public/'));
module.exports = app;