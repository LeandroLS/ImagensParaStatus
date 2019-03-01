MongoClient = require('mongodb').MongoClient;
class DataBase {
    constructor(){
        this.url = 'mongodb://localhost:27017';
        this.dbName = 'EscreverNaImagem';
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
}
db = new DataBase();
module.exports = db.connectDB();