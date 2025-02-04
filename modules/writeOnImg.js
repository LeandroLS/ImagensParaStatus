const util = require('./libs/util');
const fontsDB = require('./database/collectionFonts');
const jimp = require('jimp');
const appPath = require('./config/path');
const path = require('path');
app.get('/edit-image/:fileName', (req, res) => {
    let query = { 'fileName' : req.params.fileName };
    let images = imageDB.find(query);
    let fonts = fontsDB.find({});
    Promise.all([images, fonts]).then((data)=>{
        return res.render('edit-image', { 
            image : data[0][0],
            fonts : data[1]
        });
    }).catch((err) => {
        return res.render('edit-image');
    });
});

app.post('/edit-image/:fileName', (req,res) => {
    let phrase = req.body.userText;
    let pctY = req.body.pctY;
    let pctX = req.body.pctX;
    let originalImgName = req.body.originalImgName;
    let fontZise = req.body.fontSize;
    let fontChosen = req.body.fontChosen;
    let font = fontChosen + '\\' + fontChosen + '-' + fontZise + '.fnt';
    if(!phrase) {
        res.redirect(`/edit-image/:${originalImgName}`);
    }

    let pathImg = path.normalize(appPath.imgPath + originalImgName);
    jimp.read(pathImg, function(err,img) {
        if(err) throw err;
        let position = util.calcPctOverImg(img.bitmap.width, img.bitmap.height, pctX, pctY);
        jimp.loadFont(appPath.fontsPath + font).then((font)=>{
            img.print(font, position.posX, position.posY, phrase);
            img.write(appPath.editedImgPath + 'teste.jpg');
            return res.redirect(`/`);
        }).catch((erro)=> {
            throw erro;
        });
    });
});