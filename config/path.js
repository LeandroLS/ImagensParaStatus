const path = require('path');
const viewsPath = path.normalize(__dirname + '/../public/views/');
const publicPath = path.normalize(__dirname + '/../public/');
const fontsPath = path.normalize(__dirname + '/../public/fonts/');
const imgPath = path.normalize(__dirname + '/../public/images/');
const editedImgPath = path.normalize(__dirname + '/../public/images/edited-images/');
const originalImgPath = path.normalize(__dirname + '/../public/images/original-images/');

module.exports = {
    viewsPath : viewsPath,
    publicPath : publicPath,
    fontsPath : fontsPath,
    imgPath : imgPath,
    editedImgPath : editedImgPath,
    originalImgPath : originalImgPath,
};