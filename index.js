const app = require('./config/express');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://llimas:04159632@imagensparastatus-6qfkr.gcp.mongodb.net/test?retryWrites=true";';
const dbName = 'ImagensParaStatus';
const mongoClient = new MongoClient(url, { useNewUrlParser: true });
mongoClient.connect().then(db => {
    app.locals.db = mongoClient.db(dbName);
}).catch(err => {
    console.error('Erro pra se conectar no banco.', err);
});
require('./controllers/adminController');
require('./controllers/mainController');
app.listen(9090);