const path = require('path');
const viewsPath = path.normalize(__dirname + '/../public/views/');
const publicPath = path.normalize(__dirname + '/../public/');
const userImgPath = path.normalize(__dirname + '/../public/images/user-images/');
const fontsPath = path.normalize(__dirname + '/../public/fonts/');
const imgPath = path.normalize(__dirname + '/../public/images/');


module.exports = {
    viewsPath : viewsPath,
    publicPath : publicPath,
    userImgPath : userImgPath,
    fontsPath : fontsPath,
    imgPath : imgPath
};