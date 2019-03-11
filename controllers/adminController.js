const app = require('../config/express');
const jwt = require('jsonwebtoken');
const auth = require('../config/auth.json');
const upload = require('../config/upload');
const { rename, unlink } = require('fs');
const path = require('path');
const crypto = require('crypto');
function verifyToken(req, res, next){
    let token = req.body.token || req.query.token;
    if(req.path == '/login' || req.path == '/auth' || req.path == '/upload-images') return next();
    jwt.verify(token, auth.secret, (err, decoded) =>{
        if (err) return res.send({ message : 'Token need to be provided' });
        return next();
    });
}
async function verifyTokenUploadImages(req, res, next){
    let token = req.body.token || req.query.token;
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
app.get('/admin/images', async (req,res) => {
    let { message, success, token } = req.query;
    message = { message, success };
    let db = app.locals.db;
    let images = await db.collection('Images').find().toArray();
    return res.render('admin/images', {
        images : images,
        message : message,
        token : token
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
        db.collection('Phrases').deleteOne({ fileName : fileName }).then(result => {
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
app.get('/admin/upload-images', verifyTokenUploadImages, async (req, res) => {
    let { message, success, token } = req.query;
    message = { success : success, message: message };
    let db = app.locals.db;
    let categories = await db.collection('Categories').find().toArray();
    return res.render('admin/upload-images', {
        message : message,
        categories : categories,
        token : token
    });
});

app.post('/admin/auth', (req, res) => {
    let { user, password } = req.body;
    let algorithm = 'aes256';
    let cipher = crypto.createCipher(algorithm, auth.secret);
    let encrypted = cipher.update(password, 'utf8', 'hex') + cipher.final('hex');
    if ( user != auth.user || encrypted != auth.password ){
        return res.redirect('/admin/login?message=Usuário ou senha inválidos.');
    }
    let token = jwt.sign({ user : auth.user }, auth.secret, { expiresIn: 30000 });
    return res.redirect('/admin/dashboard?message=Logado com sucesso.&token=' + token);
});
app.post('/admin/upload-images', upload.single('image'), verifyTokenUploadImages, async (req, res) => {
    let { originalname, filename } = req.file;
    let { category, existentCategory, phrase, token } = req.body;
    let db = app.locals.db;
    if(existentCategory != ''){
        category = existentCategory;
    }
    let phrases = await db.collection('Phrases').find({ phrase : phrase }).toArray();
    try {
        if(phrases.length == 0){
            db.collection('Phrases').insertOne({
                phrase: phrase,
                category: category,
                fileName: filename
            });
        } else {
            throw new Error("Frase já existe.");
        }

        let categorias = await db.collection('Categories').find({category : category}).toArray();
        if(categorias.length == 0){
            await db.collection('Categories').insertOne({
                category : category
            });
        }

        let qtdImages = await db.collection('Images').countDocuments();
        await db.collection('Images').insertOne({
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
    } catch(erro){
        unlink(path.normalize('./public/images/original-images/' + filename), (err) => {
            if(err) console.log(err);
            console.log('Arquivo removido');
        });
        let result = {
            success: false,
            message: 'Frase já existe'
        };
        return res.redirect('/admin/upload-images?success=false&message=' + result.message + '&token=' + token);
    }
});

