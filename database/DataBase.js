const app = require('../config/express');
const MongoClient = require('mongodb').MongoClient;
if(process.env.AMBIENTE == 'production'){
    var url = 'sua conexão com o mongo db de produção';
} else {
    var url = 'mongodb://localhost:27017';
}
const dbName = 'ImagensParaStatus';
const mongoClient = new MongoClient(url, { useNewUrlParser: true });
mongoClient.connect().then(db => {
    app.locals.db = mongoClient.db(dbName);
}).catch(err => {
    console.error('Erro pra se conectar no banco.', err);
});