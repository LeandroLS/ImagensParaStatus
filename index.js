"use strict";
const app = require('./config/express');
const upload = require('./config/upload');
const { rename, unlink   } = require('fs');
const path = require('path');

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'EscreverNaImagem';
const client = new MongoClient(url, { useNewUrlParser: true });
client.connect().then(db => {
    app.locals.db = client.db(dbName);
}).catch(err => {
    console.error('Erro pra se conectar no banco.', err);
})

function checkIfCategoryExists(req, res, next) {
    let category = req.params.category;
    if(typeof category === 'undefined'){
        return next();
    }
    let db = app.locals.db;
    db.collection('Categories').find().toArray().then(categories => {
        let categoriesFilter = categories.filter(value => value.category == category);
        if(categoriesFilter.length >= 1){
            return next();
        } else {
            return res.send('Página não existe.');
        }
    });
}

app.get('/:category?', checkIfCategoryExists, (req, res) => {
    let category = req.params.category;
    let header = "Imagens.";
    let imagesPerPage = 2;
    var filter = {};
    if(category) {
        filter = { category : category };
        header = `Imagens de ${category}.`;  
    }
    let db = app.locals.db;
    let numberOfPages = db.collection('Images').countDocuments().then(qtdImages =>  Math.floor(qtdImages / imagesPerPage));
    let images = db.collection('Images').find(filter).limit(imagesPerPage).toArray().then(images => images);
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

app.get('/page/:number/:category?', (req, res) => {

    if(req.params.number){
        var pageNumber = req.params.number;
        var filter = {
            id : { $gte : parseInt(pageNumber) }
        };
    } else {
        var pageNumber = 0;
        var filter = {};
    }

    let imagesPerPage = 1;
    let db = app.locals.db;
    let numberOfPages = db.collection('Images').countDocuments().then(qtdImages => Math.floor(qtdImages / imagesPerPage));
    let images = db.collection('Images').find(filter).limit(imagesPerPage).toArray().then(images => images);
    let categories = db.collection('Categories').find().toArray().then(categories => categories);
    Promise.all([images, categories, numberOfPages]).then(data => {
        return res.render('index', {
            images : data[0],
            categories : data[1],
            numberOfPages : data[2]
        });
    });
});

app.get('/search/phrase', (req, res) => {
    let query = req.query;
    let phrase = query.phrase;
    let db = app.locals.db;
    let images = db.collection('Images').find({ phrase: {$regex: `.*${phrase}.*`, $options:"i"}}).toArray().then(images => images);
    let categories = db.collection('Categories').find().toArray().then(categories => categories);
    Promise.all([images, categories]).then(data => {
        return res.render('index', {
            images : images,
            categories : categories
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

    let db = app.locals.db;
    db.collection('Images').find().toArray().then(images => {
        return res.render('admin/admin-images', {
            images : images,
            message : message
        });
    });
});

app.get('/admin/remove-image', (req,res) => {
    let fileName = req.query;
    let db = app.locals.db;
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

app.get('/admin/upload-images', (req, res) => {
    let message = req.query;
    let db = app.locals.db;
    db.collection('Categories').find().toArray().then(categories => {
        return res.render('admin/upload-images', {
            message : message,
            categories : categories
        });
    });
});

app.post('/images', upload.single('image'), (req, res) => {
    let originalName = req.file.originalname;
    let fileName =  req.file.filename;
    let phrase = req.body.phrase;
    let category = req.body.category;
    let categoryExistent = req.body.existentCategory;
    let db = app.locals.db;
    if(categoryExistent != ""){
        category = categoryExistent;
    }
    db.collection('Phrases').find({ phrase : phrase }).toArray().then(phraseResult => {
        if(phraseResult.length == 0){
            db.collection('Phrases').insert({
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
        db.collection('Categories').find({category : category}).toArray().then(categoryResult => {
            if(categoryResult.length == 0){
                db.collection('Categories').insert({
                    category : category
                })
            }
        })
    }).then(() => {
        db.collection('Images').countDocuments().then(qtdImages => {
            db.collection('Images').insert({
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
        })
    }).catch(erro => {
        unlink(path.normalize('./public/images/original-images/' + fileName), (err) => {
            if(err) console.log(err);
            console.log('Arquivo removido');
        })
        return res.redirect('admin/upload-images?success=false&message=' + erro.message);
    });
});

app.listen(9090);