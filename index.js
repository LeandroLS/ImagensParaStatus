const app = require('./config/express');
const upload = require('./config/upload');
const imageDB = require('./database/collectionImages');

app.get('/', (req, res) => {
    let images = imageDB.list();
    images.then((images) => {
        res.render('index', {
            images : images
        });
    }).catch((err) => {
        res.render('index');
    });
});

app.get('/upload-images', (req, res) => {
    res.render('upload-images');
});

app.post('/images', upload.single('image'), (req, res) => {
    if(req.file){
        imageDB.insert({
            originalName: req.file.originalname, 
            fileName: req.file.filename
        });
    }
    res.redirect(301,'upload-images');
});

app.listen(8000);