const app = require('./config/express');
const upload = require('./config/upload');
const image = require('./database/collectionImages');

app.get('/', (req, res) => {
    res.render('index', {
        images : null
    });
});

app.get('/upload-images', (req, res) => {
    res.render('upload-images');
});

app.post('/images', upload.single('image'), (req, res) => {
    if(req.file){
        image.insert({
            originalName: req.file.originalname, 
            fileName: req.file.filename
        });
        res.redirect('upload-images');
    } else {
        res.redirect('upload-images');
    }
});

app.listen(8000);