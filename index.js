"use strict";
const app = require('./config/express');
const upload = require('./config/upload');
const { rename, unlink   } = require('fs');
const DB = require('./database/DB');
const DBConnection = require('./database/DataBase');
const DataBase = DBConnection;
const path = require('path');
const collectionImages = new DB('Images');
const collectionPhrase = new DB('Phrases');
const collectionCategories = new DB('Categories');

function checkIfCategoryExists(req, res, next) {
    let category = req.params.category;
    if(typeof category === 'undefined'){
        return next();
    }
    DataBase.getConnection().then(db => {
        db.collection('Categories').find().toArray().then(categories => {
            let categoriesFilter = categories.filter(value => value.category == category);
            if(categoriesFilter.length >= 1){
                return next();
            } else {
                return res.send('Página não existe.');
            }
        });
    })
}

app.get('/:category?', checkIfCategoryExists, (req, res) => {
    let category = req.params.category;
    let header = "Imagens.";
    let imagesPerPage = 1;
    var filter = {};
    if(category) {
        filter = { category : category };
        header = `Imagens de ${category}.`;  
    }
    DataBase.getConnection().then(db => {
        let numberOfPages = db.collection('Images').countDocuments().then(qtdImages =>  Math.floor(qtdImages / imagesPerPage));
        let images = db.collection('Images').find({}).limit(imagesPerPage).toArray().then(images => images);
        let categories = db.collection('Categories').find().toArray().then(categories => categories);

        Promise.all([numberOfPages, images, categories]).then(data => {
            return res.render('index', {
                images : data[1],
                categories : data[2],
                header : header,
                numberOfPages : data[0]
            });
        });
    });
});

app.get('/page/:number', (req, res) => {
    if(req.params.number){
        var pageNumber = req.params.number;
    } else {
        pageNumber = 0;
    }
    let imagesPerPage = 1;
    DataBase.getConnection().then(db => {
        let numberOfPages = db.collection('Images').countDocuments().then(qtdImages => Math.floor(qtdImages / imagesPerPage));
        let images = db.collection('Images').find({ 'id' : { $gte: parseInt(pageNumber) } }).limit(imagesPerPage).toArray().then(images => images);
        let categories = db.collection('Categories').find().toArray().then(categories => categories);
        Promise.all([images,categories, numberOfPages]).then(data => {
            return res.render('index', {
                images : images,
                categories : categories,
                numberOfPages : numberOfPages
            });
        });
    });
});

app.get('/search/phrase', (req, res) => {
    let query = req.query;
    let phrase = query.phrase;
    DataBase.getConnection().then(db => {
        let images = db.collection('Images').find({ phrase: {$regex: `.*${phrase}.*`, $options:"i"}}).toArray().then(images => images);
        let categories = db.collection('Categories').find().toArray().then(categories => categories);
        Promise.all([images, categories]).then(data => {
            return res.render('index', {
                images : images,
                categories : categories
            });
        });
    });
});

app.get('/admin/dashboard', (req,res) => {
    return res.render('admin/admin');
});

app.get('/admin/images', (req,res) => {
    let message = '';
    if(req.query){
        message = req.query;
    } else {
        message = false;
    }

    DataBase.getConnection().then(db => {
        db.collection('Images').find().toArray().then(images => {
            return res.render('admin/admin-images', {
                images : images,
                message : message
            });
        });
    });
});

app.get('/admin/remove-image', (req,res) => {
    let fileName = req.query;
    DataBase.getConnection().then(db => {
        db.collection('Images').deleteOne(fileName).then(result => {
            rename(
                path.normalize('./public/images/original-images/' + fileName.fileName), 
                path.normalize('./public/images/deleted-images/' + fileName.fileName), 
                (err) => {
                if(err) throw err;
                console.log('Imagem movida com sucesso');
            });
        }).then(() => {
            db.collection('Phrases').updateOne(fileName, {$set: {fileName: ""} });
            let message = {
                success: true,
                message: 'Imagem removida com sucesso.' 
            }
            return res.redirect(`/admin/images?success=${message.success}&message=${message.message}`);
        }).catch(err => {
            let message = {
                success: false,
                message: "Algo deu errado."
            }
            return res.redirect(`/admin/images?success=${message.success}&message=${message.message}`);
        });
    });
});

app.get('/admin/upload-images', (req, res) => {
    let message = req.query;
    DataBase.getConnection().then(db => {
        db.collection('Categories').find().toArray().then(categories => {
            return res.render('admin/upload-images', {
                message : message,
                categories : categories
            });
        });
    });
});

app.post('/images', upload.single('image'), (req, res) => {
    let originalName = req.file.originalname;
    let fileName =  req.file.filename;
    let phrase = req.body.phrase;
    let category = req.body.category;
    let categoryExistent = req.body.existentCategory;

    if(categoryExistent != ""){
        category = categoryExistent;
    }

    collectionPhrase.find({ phrase : phrase }).then(phraseResult => {
        if(phraseResult.length == 0){
            collectionPhrase.insert({
                phrase: phrase,
                category: category,
                fileName: fileName
            });
        } else {
            let result = {
                success: false,
                message: "Frase já existe"
            }
            return Promise.reject(result);
        }
    }).then(() => {
        collectionCategories.find({category : category})
        .then(categoryResult => {
            if(categoryResult.length == 0){
                collectionCategories.insert({
                    category : category
                })
            }
        });
    }).then(() => {
        collectionImages.count().then(qtdImages => {
            collectionImages.insert({
                originalName: originalName, 
                fileName: fileName,
                category: category,
                phrase: phrase,
                id: qtdImages+1
            });
            let result = {
                success: true,
                message: "Imagem inserida com sucesso."
            }
            return res.redirect('admin/upload-images?success=' +  result.success + '&message=' + result.message);
        });
       
    }).catch(erro => {
        unlink(path.normalize('./public/images/original-images/' + fileName), (err) => {
            if(err) console.log(err);
            console.log('Arquivo removido');
        })
        return res.redirect('admin/upload-images?success=false&message=' + erro.message);
    });
});

app.listen(9090);