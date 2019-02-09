const express = require('express');
const app = express();
const path = require('path');
const viewsPath = path.normalize(__dirname + '/../public/views');
app.set('views', viewsPath);
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/../public/'));
module.exports = app;