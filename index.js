const app = require('./config/express');
const upload = require('./config/upload');
const imageDB = require('./database/collectionImages');
const phraseDB = require('./database/collectionPhrases');
const ImgManipulator = require('./libs/ImgManipulator');

app.get('/', (req, res) => {
    let images = imageDB.list( { phrase : { $exists: true } } );
    images.then((images) => {
        return res.render('index', {
            images : images
        });
    }).catch((err) => {
        return res.render('index');
    });
});

app.get('/teste', (req,res) => {
    let images = imageDB.list();
    images.then(image => {
        ImgManipulator.blurImgAndPrint(image[0]);
    });
});

app.get('/upload-images', (req, res) => {
    return res.render('upload-images');
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
            if(err) return res.redirect(301,'upload-images');
        });
    }
    return res.redirect(301,'upload-images');
});

app.listen(1010);