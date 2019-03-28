const app = require('../config/express');
module.exports = {
    async setDescription(description, urlName){
        let collection = await app.locals.db.collection('Categories');
        collection.updateOne({ urlName }, { $set : { description }}, (err, ret) => {
            if(ret.modifiedCount >= 1) {
                return true;
            } else {
                return false;
            }
        });
    },
    async getCategories(param = null){
        let categories = await app.locals.db.collection('Categories').find(param).toArray();
        return categories;
    }
}