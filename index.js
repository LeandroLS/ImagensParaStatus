const app = require('./config/express');
const upload = require('./config/upload');
const imageDB = require('./database/collectionImages');

app.get('/', (req, res) => {
    let images = imageDB.list();
    images.then((images) => {
        return res.render('index', {
            images : images
        });
    }).catch((err) => {
        return res.render('index');
    });
});

app.get('/upload-images', (req, res) => {
    return res.render('upload-images');
});

app.get('/edit-image/:fileName', (req, res) => {
    let query = { 'fileName' : req.params.fileName };
    let images = imageDB.list(query);
    images.then((image) => {
        return res.render('edit-image', { image : image[0] });
    }).catch((err) => {
        return res.render('edit-image');
    });
});

app.post('/images', upload.single('image'), (req, res) => {
    if(req.file){
        let image = imageDB.insert({
            enabled: true,
            originalName: req.file.originalname, 
            fileName: req.file.filename
        });
        image.then((result)=>{
            return res.redirect(301,'upload-images');
        }).catch((err)=>{
            return res.redirect(301,'upload-images');
        });
    }
    return res.redirect(301,'upload-images');
});

app.listen(8000);