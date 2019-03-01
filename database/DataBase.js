const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'EscreverNaImagem';

// Create a new MongoClient
const client = new MongoClient(url);
// Use connect method to connect to the Server


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
    
    async getDB(){
        let db = await this.connectDB();
        return db;
    }
    
};