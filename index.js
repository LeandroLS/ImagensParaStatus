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

app.use('/admin', validToken);

function validToken(req, res, next){
    let { token } = req.query;
    if(req.path == '/login' || req.path == '/auth') return next();
    jwt.verify(token, auth.secret, (err, decoded) =>{
        if (err) return res.send({ message : 'Token need to be provided' });
        return next();
    });
}

app.post('/admin/auth', (req, res) => {
    let { user, password } = req.body;
    if ( user != auth.user || password != auth.password ){
        return res.render('admin/login', {
            message : { success: 'false', message : "Login falhou" }
        });
    }
    let token = jwt.sign({ user : auth.user}, auth.secret, { expiresIn: 30000 });
    return res.render('admin/dashboard', {
        message : { success: 'true', message : "Logado com sucesso." },
        token : token
    });
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
    return res.render('admin/dashboard');
});

app.get('/admin/login', (req, res) => {
    return res.render('admin/login');
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
        return res.render('admin/images', {
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
    let { message, success, token } = req.query;
    message = { success : success, message: message };
    let db = app.locals.db;
    db.collection('Categories').find().toArray().then(categories => {
        return res.render('admin/upload-images', {
            message : message,
            categories : categories,
            token : token
        });
    });
});

app.post('/images', upload.single('image'), (req, res) => {
    let { originalname, filename} = req.file;
    let { category, existentCategory, phrase, token } = req.body;
    let db = app.locals.db;
    if(existentCategory != ''){
        category = existentCategory;
    }
    db.collection('Phrases').find({ phrase : phrase }).toArray().then(phraseResult => {
        if(phraseResult.length == 0){
            db.collection('Phrases').insertOne({
                phrase: phrase,
                category: category,
                fileName: filename
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
                originalName: originalname, 
                fileName: filename,
                category: category,
                phrase: phrase,
                id: qtdImages+1
            });
            let result = {
                success: true,
                message: 'Imagem inserida com sucesso.'
            };
            return res.redirect('admin/upload-images?success=' +  result.success + '&message=' + result.message + '&token=' + token);
        });
    }).catch(erro => {
        unlink(path.normalize('./public/images/original-images/' + filename), (err) => {
            if(err) console.log(err);
            console.log('Arquivo removido');
        });
        return res.redirect('admin/upload-images?success=false&message=' + erro.message + '&token=' + token);
    });
});

app.listen(9090);