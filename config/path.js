const path = require('path');
const viewsPath = path.normalize(__dirname + '/../public/views/');
const publicPath = path.normalize(__dirname + '/../public/');
const userImgPath = path.normalize(__dirname + '/../public/images/user-images/');

module.exports = {
    viewsPath : viewsPath,
    publicPath : publicPath,
    userImgPath : userImgPath
};