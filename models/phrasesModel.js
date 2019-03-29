const app = require('../config/express');
module.exports = {
    async getPhrases(param = null){
        let phrases = await app.locals.db.collection('Phrases').find(param).toArray();
        return phrases;
    },
    async insertPhrase(param){
        await app.locals.db.collection('Phrases').insertOne(param);
    },
    async deletePhrase(param){
        await app.locals.db.collection('Phrases').deleteOne(param);
    }
}