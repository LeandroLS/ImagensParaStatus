const jimp = require('jimp');
const appPaths = require('../config/path');
const moment = require('moment');
module.exports = {
    async loadImage(imageName){
        let imageLoaded = await jimp.read(appPaths.originalImgPath + imageName);
        return imageLoaded;
    },
    async blur(image){
        image.blur(5);
        return image;
    },
    async resizeImage(image){
        return image.resize(800, jimp.AUTO);
    },
    async loadFont(){
        let font =  await jimp.loadFont(jimp.FONT_SANS_64_WHITE);
        return font;
    },
    async print(image, font){
        image.print(font, 0, 0, {
                            text: 'uma frase bem grande só pra ver o que vai aconteceraooooo',
                            alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
                            alignmentY: jimp.VERTICAL_ALIGN_MIDDLE
                        }, image.bitmap.width, image.bitmap.height);
        return image;
    },
    async edit(image){
        let loadedImage = await this.loadImage(image.fileName);
        let blurImage = await this.blur(loadedImage);
        let resizeImage = await this.resizeImage(blurImage);
        let font = await this.loadFont();
        let imagePrinted = await this.print(resizeImage, font);
        imagePrinted.write(appPaths.editedImgPath + `${image.fileName}`);
    }
}