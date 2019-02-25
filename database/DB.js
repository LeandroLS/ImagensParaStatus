MongoClient = require('mongodb').MongoClient;
module.exports = class DB {
    constructor(collection){
        this.url = 'mongodb://localhost:27017';
        this.dbName = 'EscreverNaImagem';
        this.collection = collection;
        this.client = new MongoClient(this.url, { useNewUrlParser: true });
    }

    async connectDB(){
        try {
            await this.client.connect();
            let db = this.client.db(this.dbName);
            return db;
        } catch (error) {
            throw error
        }
    }
    async insert(image){
        try {
            let db = await this.connectDB();
            let result = await db.collection(this.collection).insertOne(image);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async list(query = {}){
        try {
            let db = await this.connectDB();
            let result = await db.collection(this.collection).find(query).toArray();
            return result;
        } catch (err) {
            throw err;
        }
    }

    async remove(imagem) {
        try {
            let db = await this.connectDB();
            let result = await db.collection(this.collection).deleteOne(imagem);
            return result;
        } catch (err) {
            throw err;
        }
    }

    async updateOne(object, newValues) {
        try {
            let db = await this.connectDB();
            let result = await db.collection(this.collection).updateOne(object, newValues);
            return result;
        } catch (err) {
            throw err;
        }
    }
}