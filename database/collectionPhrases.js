const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'EscreverNaImagem';
const collection = 'Phrases';
const client = new MongoClient(url, { useNewUrlParser: true });

async function connectDB(){
    try {
        await client.connect();
        let db = client.db(dbName);
        let col = db.collection(collection);
        return col;
    } catch (error) {
        throw error
    }
}

async function list(query = {}){
    try {
        let col = await connectDB();
        let result = await col.find(query).toArray();
        return result;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    list
}