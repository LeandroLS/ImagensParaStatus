const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const path = require('path');
const viewsPath = path.normalize(__dirname + '/../public/views');
app.set('views', viewsPath);
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/../public/'));
module.exports = app;