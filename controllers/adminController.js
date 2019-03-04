const app = require('../config/express');
const jwt = require('jsonwebtoken');
const auth = require('../config/auth.json');
const upload = require('../config/upload');
const { rename, unlink } = require('fs');
const path = require('path');
function verifyToken(req, res, next){
    let token = req.body.token || req.query.token;
    if(req.path == '/login' || req.path == '/auth' || req.path == '/upload-images') return next();
    jwt.verify(token, auth.secret, (err, decoded) =>{
        if (err) return res.send({ message : 'Token need to be provided' });
        return next();
    });
}
function verifyTokenUploadImages(req, res, next){
    let token = req.body.token || req.query.token;
    console.log(token);
    jwt.verify(token, auth.secret, (err, decoded) =>{
        if (err) return res.send({ message : 'Token need to be provided' });
        return next();
    });
}
app.use('/admin', verifyToken);
app.get('/admin/dashboard', (req,res) => {
    let { message, token } = req.query;
    return res.render('admin/dashboard', { message : message, token : token });
});
app.get('/admin/login', (req, res) => {
    let message = req.query.message;
    return res.render('admin/login', { message : message });
});
app.get('/admin/images', (req,res) => {
    let { message, success, token } = req.query;
    message = { message, success };
    let db = app.locals.db;
    db.collection('Images').find().toArray().then(images => {
        return res.render('admin/images', {
            images : images,
            message : message,
            token : token
        });
    });
});
app.get('/admin/remove-image', (req,res) => {
    let { fileName, token } = req.query;
    let db = app.locals.db;
    db.collection('Images').deleteOne({ fileName : fileName }).then(result => {
        rename(
            path.normalize('./public/images/original-images/' + fileName), 
            path.normalize('./public/images/deleted-images/' + fileName), 
            (err) => {
                if(err) console.error('Algo deu errado na hora de deletar a imagem', err);
                console.log('Imagem movida com sucesso');
            });
    }).then(() => {
        db.collection('Phrases').updateOne({ fileName : fileName }, {$set: {fileName: ''} });
        let message = {
            success: true,
            message: 'Imagem removida com sucesso.' 
        };
        return res.redirect(`/admin/images?success=${message.success}&message=${message.message}&token=${token}`);
    }).catch(err => {
        console.error('Algo deu errado.', err);
        let message = {
            success: false,
            message: 'Algo deu errado.'
        };
        return res.redirect(`/admin/images?success=${message.success}&message=${message.message}&token=${token}`);
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

app.post('/admin/auth', (req, res) => {
    let { user, password } = req.body;
    if ( user != auth.user || password != auth.password ){
        return res.redirect('/admin/login?message=Usuário ou senha inválidos.');
    }
    let token = jwt.sign({ user : auth.user}, auth.secret, { expiresIn: 30000 });
    return res.redirect('/admin/dashboard?message=Logado com sucesso.&token=' + token);
});
app.post('/admin/upload-images', upload.single('image'), verifyTokenUploadImages, (req, res) => {
    let { originalname, filename } = req.file;
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
            return res.redirect('/admin/upload-images?success=' +  result.success + '&message=' + result.message  +'&token=' + token);
        });
    }).catch(erro => {
        unlink(path.normalize('./public/images/original-images/' + filename), (err) => {
            if(err) console.log(err);
            console.log('Arquivo removido');
        });
        return res.redirect('/admin/upload-images?success=false&message=' + erro.message + '&token=' + token);
    });
});

