const app = require('../config/express');
module.exports = {
    async getRelatedImages(image){
        let relatedImages = await app.locals.db.collection('Images')
        .find({ '_id' : { $ne: image._id }, category : image.category })
        .limit(6).toArray();
        return relatedImages;
    },
    async deleteImage(fileName){
        await app.locals.db.collection('Images').deleteOne({ fileName : fileName });
    },
    async getImages(param = null){
        let images = await app.locals.db.collection('Images').find(param).toArray();
        return images;
    }
}