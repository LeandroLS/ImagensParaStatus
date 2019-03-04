const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'ImagensParaStatus';
const client = new MongoClient(url, { useNewUrlParser: true });

module.exports = {
    async connectDB(){
        try {
            await client.connect();
            let db = client.db(dbName);
            return db;
        } catch (error) {
            throw error
        }
    },
    closeConnection(){
        client.close();
    },
    async getConnection(){
        let db = await this.connectDB();
        return db;
    }
};