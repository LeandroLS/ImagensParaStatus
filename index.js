const app = require('./config/express');
const upload = require('./config/upload');

const MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/";

app.get('/', (req, res) => {
    let images = '';
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("EscreverNaImagem");
        dbo.collection("Images").find({}).toArray((err, docs) => {
            if (err) throw err;
            console.log(docs);
            if(images.length >= 1){
                images = docs;
            } else {
                images = null
            }
            db.close();
            res.render('index', {
                images : images
            });
        });
    });
});

app.get('/upload-images', (req, res) => {
    res.render('upload-images');
});

app.post('/images', upload.single('incomingImageUpload'), (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("EscreverNaImagem");
        let query = { fileName: req.file.filename };
        dbo.collection("Images").insert(query, function(err, result) {
            if (err) throw err;
            db.close();
        });
    });
    res.redirect('/');
});

app.listen(8000);