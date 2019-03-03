const app = require('./config/express');
const upload = require('./config/upload');
const { rename, unlink } = require('fs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'EscreverNaImagem';
const jwt = require('jsonwebtoken');
const auth = require('./config/auth.json');
const mongoClient = new MongoClient(url, { useNewUrlParser: true });
app.locals.imagesPerPage = 1;
mongoClient.connect().then(db => {
    app.locals.db = mongoClient.db(dbName);
}).catch(err => {
    console.error('Erro pra se conectar no banco.', err);
});

function checkIfCategoryExists(req, res, next) {
    let  { category } = req.params;
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

app.post('/admin/login', (req, res) => {
    let token = jwt.sign({ id : 123}, auth.secret, { expiresIn: 30000 });
    jwt.verify(token, auth.secret, (err, decoded) =>{
        if (err) console.error(err);
        return decoded;
    });
    // return res.status(200).send({ token });
});

app.get('/:category?', checkIfCategoryExists, (req, res) => {
    let { category } = req.params;
    let header = 'Imagens.';
    var filter = {};

    if(category) {
        filter = { category : category };
        header = `Imagens de ${category}.`;
    }

    let imagesPerPage = app.locals.imagesPerPage;
    let db = app.locals.db;
    let numberOfPages = db.collection('Images').countDocuments(filter).then(qtdImages =>  Math.floor(qtdImages / imagesPerPage));
    let images = db.collection('Images').find(filter).limit(imagesPerPage).toArray().then(images => images);
    let categories = db.collection('Categories').find().toArray().then(categories => categories);

    Promise.all([numberOfPages, images, categories]).then(data => {
        return res.render('index', {
            numberOfPages : data[0],
            images : data[1],
            categories : data[2],
            categoryPagination : category,
            header : header
        });
    });
});

app.get('/:category?/page/:number', (req, res) => {
    let imagesPerPage = app.locals.imagesPerPage;
    
    if(req.params.number){
        var pageNumber = req.params.number;
        var filterImages = {
            id : { $gt : parseInt((pageNumber * imagesPerPage) - imagesPerPage) }
        };
        if(req.params.category){
            var category = req.params.category;
            var filterNumberOfPages = { category : category };
            filterImages.category = category;
        } else {
            var filterNumberOfPages = {};
        }
    } else {
        var filterImages = {};
    }
    let db = app.locals.db;
    let numberOfPages = db.collection('Images').countDocuments(filterNumberOfPages).then(qtdImages => Math.floor(qtdImages / imagesPerPage));
    let images = db.collection('Images').find(filterImages).limit(imagesPerPage).toArray().then(images => images);
    let categories = db.collection('Categories').find().toArray().then(categories => categories);
    Promise.all([images, categories, numberOfPages]).then(data => {
        return res.render('index', {
            images : data[0],
            categories : data[1],
            numberOfPages : data[2],
            categoryPagination : category
        });
    });
});

app.get('/search/phrase', (req, res) => {
    let { phrase } = req.query;
    let db = app.locals.db;
    let images = db.collection('Images').find({ phrase: {$regex: `.*${phrase}.*`, $options:'i'}}).toArray().then(images => images);
    let categories = db.collection('Categories').find().toArray().then(categories => categories);
    Promise.all([images, categories]).then(data => {
        return res.render('index', {
            images : data[0],
            categories : data[1]
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
        db.collection('Phrases').updateOne(fileName, {$set: {fileName: ''} });
        let message = {
            success: true,
            message: 'Imagem removida com sucesso.' 
        };
        return res.redirect(`/admin/images?success=${message.success}&message=${message.message}`);
    }).catch(err => {
        let message = {
            success: false,
            message: 'Algo deu errado.'
        };
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
    let { originalName, fileName } = req.file;
    let { category, categoryExistent, phrase } = req.body;
    let db = app.locals.db;
    if(categoryExistent != ''){
        category = categoryExistent;
    }
    db.collection('Phrases').find({ phrase : phrase }).toArray().then(phraseResult => {
        if(phraseResult.length == 0){
            db.collection('Phrases').insertOne({
                phrase: phrase,
                category: category,
                fileName: fileName
            });
        } else {
            let result = {
                success: false,
                message: 'Frase já existe'
            };
            return Promise.reject(result);
        }
    }).then(() => {
        db.collection('Categories').find({category : category}).toArray().then(categoryResult => {
            if(categoryResult.length == 0){
                db.collection('Categories').insertOne({
                    category : category
                });
            }
        });
    }).then(() => {
        db.collection('Images').countDocuments().then(qtdImages => {
            db.collection('Images').insertOne({
                originalName: originalName, 
                fileName: fileName,
                category: category,
                phrase: phrase,
                id: qtdImages+1
            });
            let result = {
                success: true,
                message: 'Imagem inserida com sucesso.'
            };
            return res.redirect('admin/upload-images?success=' +  result.success + '&message=' + result.message);
        });
    }).catch(erro => {
        unlink(path.normalize('./public/images/original-images/' + fileName), (err) => {
            if(err) console.log(err);
            console.log('Arquivo removido');
        });
        return res.redirect('admin/upload-images?success=false&message=' + erro.message);
    });
});

app.listen(9090);