const app = require('./config/express');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'ImagensParaStatus';
const mongoClient = new MongoClient(url, { useNewUrlParser: true });
app.locals.imagesPerPage = 1;
mongoClient.connect().then(db => {
    app.locals.db = mongoClient.db(dbName);
}).catch(err => {
    console.error('Erro pra se conectar no banco.', err);
});
require('./controllers/adminController');
require('./controllers/mainController');
app.listen(9090);