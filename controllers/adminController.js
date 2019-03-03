const app = require('../config/express');
const jwt = require('jsonwebtoken');
const auth = require('../config/auth.json');
const upload = require('../config/upload');
const { rename, unlink } = require('fs');
const path = require('path');
app.use('/admin', validToken);
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
    let { message, success } = req.query;
    message = { success : success, message: message };
    let db = app.locals.db;
    db.collection('Categories').find().toArray().then(categories => {
        return res.render('admin/upload-images', {
            message : message,
            categories : categories
        });
    });
});

app.post('/admin/auth', (req, res) => {
    let { user, password } = req.body;
    if ( user != auth.user || password != auth.password ){
        return res.render('admin/login', {
            message : { success: 'false', message : "Usuário ou senha inválidos." }
        });
    }
    let token = jwt.sign({ user : auth.user}, auth.secret, { expiresIn: 30000 });
    app.locals.token = token;
    return res.render('admin/dashboard', {
        message : { success: 'true', message : "Logado com sucesso." },
    });
});
app.post('/admin/images', upload.single('image'), (req, res) => {
    let { originalname, filename} = req.file;
    let { category, existentCategory, phrase } = req.body;
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
            return res.redirect('admin/upload-images?success=' +  result.success + '&message=' + result.message);
        });
    }).catch(erro => {
        unlink(path.normalize('./public/images/original-images/' + filename), (err) => {
            if(err) console.log(err);
            console.log('Arquivo removido');
        });
        return res.redirect('admin/upload-images?success=false&message=' + erro.message);
    });
});
function validToken(req, res, next){
    let token = app.locals.token;
    if(req.path == '/login' || req.path == '/auth') return next();
    jwt.verify(token, auth.secret, (err, decoded) =>{
        if (err) return res.send({ message : 'Token need to be provided' });
        return next();
    });
}
