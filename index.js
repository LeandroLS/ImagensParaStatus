const app = require('./config/express');
const upload = require('./config/upload');
const imageDB = require('./database/collectionImages');
const phraseDB = require('./database/collectionPhrases');
const jimp = require('jimp');
const appPath = require('./config/path');

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

async function blurImgAndPrint(image){
    let imageLoaded = await jimp.read(appPath.imgPath + 'original-images\\' + image.fileName);
    imageLoaded.blur(10);
    font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
    let maxWidth = 1000;
    let maxHeight = 1000;
    imageLoaded.print(font, 0, 0, 
        {
            text: 'objeto',
            alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: jimp.VERTICAL_ALIGN_MIDDLE
        },
        maxWidth,
        maxHeight
    );
    imageLoaded.write(appPath.editedImgPath + 'blurphrase.jpg');
}

app.get('/teste', (req,res) => {
    let images = imageDB.list();
    images.then(image => {
        blurImgAndPrint(image[0]);
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