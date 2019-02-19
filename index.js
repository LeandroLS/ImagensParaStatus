const app = require('./config/express');
const util = require('./config/util');
const upload = require('./config/upload');
const imageDB = require('./database/collectionImages');
const jimp = require('jimp');
const appPath = require('./config/path');
const path = require('path');

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

app.get('/teste', (req,res) => {
    res.render('teste');
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
            return res.redirect(301,'upload-images');
        });
    }
    return res.redirect(301,'upload-images');
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

app.post('/edit-image/:fileName', (req,res) => {
    let phrase = req.body.userText;
    let pctY = req.body.pctY;
    let pctX = req.body.pctX;
    let originalImgName = req.body.originalImgName;
    
    if(!phrase) {
        res.redirect(`/edit-image/:${originalImgName}`);
    }

    let pathImg = path.normalize(appPath.publicPath + '\\images\\' + req.body.originalImgName);
    jimp.read(pathImg, function(err,img) {
        if(err) throw err;
        let position = util.calcPctOverImg(img.bitmap.width, img.bitmap.height, pctX, pctY);
        jimp.loadFont(appPath.publicPath + '\\fonts\\jokerman.fnt').then((font)=>{
            img.print(font, position.posX, position.posY, phrase);
            img.write(appPath.userImgPath + 'teste.jpg');
            return res.redirect(`/`);
        }).catch((erro)=> {
            throw erro;
        });
    });
});
app.listen(8000);