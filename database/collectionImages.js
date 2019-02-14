const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'EscreverNaImagem';
const collection = 'Images';
const client = new MongoClient(url);

function insert(image){
    client.connect((err) => {
        if(err) throw err;
        let db = client.db(dbName);
        let col = db.collection(collection);
        col.insertOne(image, (err, result) => {
            if(err) throw err;
        });
    });
    client.close();
}

async function list(query = {}){
    try {
        await client.connect();
        let db = client.db(dbName);
        let col = db.collection(collection);
        let result = await col.find(query).toArray();
        return result;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    insert,
    list
};
