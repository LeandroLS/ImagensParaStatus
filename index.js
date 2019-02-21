const app = require('./config/express');
const upload = require('./config/upload');
const imageDB = require('./database/collectionImages');
const phraseDB = require('./database/collectionPhrases');
const ImgManipulator = require('./libs/ImgManipulator');
const imageEditedDB = require('./database/collectionEditedImages');

app.get('/', (req, res) => {
    let images = imageEditedDB.list( { phrase : { $exists: true } } );
    images.then((images) => {
        return res.render('index', {
            images : images
        });
    }).catch((err) => {
        return res.render('index');
    });
});

app.get('/teste', (req,res) => {
    res.send('e ai crl');
    console.log('passei aqui');
    let originalImages = imageDB.list({ phrase : { $exists: false } })
    .then(images =>{
        return images
    });
    let phrases = phraseDB.list({ used : { $exists: false } })
    .then(phrases => {
        return phrases;
    });

    Promise.all([originalImages, phrases]).then((data)=>{
        let arrPhrases = data[1];
        let arrOriginalImages = data[0];
        console.log(arrPhrases);
        arrPhrases.forEach((element, index) => {
            phrases.updateOne({phrase: element.phrase}, {$set:{used:true}})
            ImgManipulator.edit(arrOriginalImages[index]);
            imageEditedDB.insert({
                enabled: true,
                fileName: arrOriginalImages[index].fileName,
                phrase: element.phrase,
                alt: element.phrase,
                category: element.category
            });
        });
    });
});

app.get('/upload-images', (req, res) => {
    return res.render('upload-images');
});

app.post('/images', upload.single('image'), (req, res) => {
    if(req.file){
        let image = imageDB.insert({
            hasPhrase: false,
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

app.listen(8000);