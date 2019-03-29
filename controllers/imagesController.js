const express = require('express'), router = express.Router();
const app = require('../config/express');
const SEOHelper = require('../libs/SEOHelper');
const { rename, unlink } = require('fs');
const jwt = require('jsonwebtoken');
const auth = require('../config/auth.json');
const path = require('path');
const upload = require('../config/upload');
const util = require('../libs/util');
const imagesModel = require('../models/imagesModel');
const categoriesModel = require('../models/categoriesModel');
const phrasesModel = require('../models/phrasesModel');
async function verifyTokenUploadImages(req, res, next){
    let token = req.body.token || req.query.token;
    jwt.verify(token, auth.secret, (err, decoded) =>{
        if (err) {
            console.log(req.headers.host);
            if(process.env.AMBIENTE == 'production'){
                return res.redirect(301, 'https://' + req.headers.host + '/');
            } else {
                return res.redirect(301, 'http://' + req.headers.host + '/');
            }
        } 
        return next();
    });
}
router.get('/images', async (req,res) => {
    let { message, success, token } = req.query;
    message = { message, success };
    let images = await imagesModel.getImages();
    return res.render('admin/images', {
        images : images,
        message : message,
        token : token
    });
});
router.get('/remove-image', (req,res) => {
    let { fileName, token } = req.query;
    let db = app.locals.db;
    imagesModel.deleteImage(fileName).then(result => {
        rename(
            path.normalize('./public/images/original-images/' + fileName), 
            path.normalize('./public/images/deleted-images/' + fileName), 
            (err) => {
                if(err) console.error('Algo deu errado na hora de deletar a imagem', err);
                console.log('Imagem movida com sucesso');
            });
    }).then(() => {
        phrasesModel.deletePhrase({ fileName : fileName }).then(result => {
            let message = {
                success: true,
                message: 'Imagem removida com sucesso.' 
            };
            return res.redirect(`/admin/images?success=${message.success}&message=${message.message}&token=${token}`);
        });
    }).catch(err => {
        console.error('Algo deu errado.', err);
        let message = {
            success: false,
            message: 'Algo deu errado.'
        };
        return res.redirect(`/admin/images?success=${message.success}&message=${message.message}&token=${token}`);
    });
   
});
router.get('/upload-images', verifyTokenUploadImages, async (req, res) => {
    let { message, success, token } = req.query;
    message = { success : success, message: message };
    let categories = await categoriesModel.getCategories();
    return res.render('admin/upload-images', {
        message : message,
        categories : categories,
        token : token
    });
});
router.post('/upload-images', upload.single('image'), verifyTokenUploadImages, async (req, res) => {
    let { filename } = req.file;
    let { category, existentCategory, phrase, token } = req.body;
    let db = app.locals.db;
    if(existentCategory != ''){
        category = existentCategory;
    }
    try {
        let phrases = await phrasesModel.getPhrases({ phrase : phrase });
        if(phrases.length >= 1){
            throw new Error("Frase já existe.");
        } else if(phrases.length == 0) {
            await phrasesModel.insertPhrase({
                phrase: phrase,
                category: category,
                fileName: filename
            });
        }

        let qtdImages = await db.collection('Images').countDocuments();
        await db.collection('Images').insertOne({
            fileName: filename,
            category: category,
            phrase: phrase,
            id: qtdImages+1
        });

        let categorias = await categoriesModel.getCategories({category : category});
        if(categorias.length == 0){
            let urlName = util.urlFriendlyer(category);
            await db.collection('Categories').insertOne({
                category : category,
                urlName : urlName
            });
        }
        let result = {
            success: true,
            message: 'Imagem inserida com sucesso.'
        };

        return res.redirect('/admin/upload-images?success=' +  result.success + '&message=' + result.message  +'&token=' + token);
    } catch(erro){
        unlink(path.normalize('./public/images/original-images/' + filename), (err) => {
            if(err) console.log(err);
            console.log('Arquivo removido');
        });
        console.error('Algum erro aconteceu:', erro);
        let result = {
            success: false,
            message: 'Frase já existe'
        };
        return res.redirect('/admin/upload-images?success=false&message=' + result.message + '&token=' + token);
    }
});
router.get('/:fileName', async (req, res) => {
    let { fileName } = req.params;
    let images = await imagesModel.getImages({ fileName : fileName });
    let metaDescription = SEOHelper.getMetaDescription(images[0].category);
    let categories = await categoriesModel.getCategories();
    let header = SEOHelper.getImagesCategoryHeader(images[0].category);
    let title = SEOHelper.getTitleDescription(images[0].category);
    let OGpropertiesFacebook = SEOHelper.facebookOGManipulator(images[0]);
    let relatedImages = await imagesModel.getRelatedImages(images[0]);
    let canonical = SEOHelper.geraCanonicalLink(req.originalUrl);
    res.render('single-image', { 
        images : images, 
        categories : categories, 
        header : header, 
        metaDescription : metaDescription,
        title : title,
        OGpropertiesFacebook : OGpropertiesFacebook,
        relatedImages : relatedImages,
        canonical : canonical
    });
});
module.exports = router;