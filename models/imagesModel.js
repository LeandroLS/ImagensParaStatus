const app = require('../config/express');
module.exports = {
    async getRelatedImages(image){
        let relatedImages = await app.locals.db.collection('Images')
        .find({ '_id' : { $ne: image._id, $gte: image._id }, category : image.category })
        .limit(6).toArray();
        return relatedImages;
    },
    async deleteImage(fileName){
        await app.locals.db.collection('Images').deleteOne({ fileName : fileName });
    },
    async getImages(param = null){
        let images = await app.locals.db.collection('Images').find(param).toArray();
        return images;
    },
    async insertImage(param){
        await app.locals.db.collection('Images').insertOne(param);
    },
    async countDocuments(param = null){
        let result = await app.locals.db.collection('Images').countDocuments(param);
        return result;
    }
}