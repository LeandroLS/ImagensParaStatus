const app = require('./config/express');
const upload = require('./config/upload');
const { rename } = require('fs');
const DB = require('./database/DB');
const path = require('path');
const collectionImages = new DB('Images');
const collectionPhrase = new DB('Phrases');
const collectionCategories = new DB('Categories');
app.get('/', (req, res) => {
    let images = collectionImages.list();
    images.then((images) => {
        return res.render('index', {
            images : images
        });
    }).catch((err) => {
        return res.render('index');
    });
});

app.get('/admin', (req,res) => {
    return res.render('admin/admin');
});

app.get('/admin/images', (req,res) => {
    let message = '';
    if(req.query){
        message = req.query;
    } else {
        message = false;
    }
    let images = collectionImages.list();
    images.then((images) => {
        return res.render('admin/admin-images', {
            images : images,
            message : message
        });
    }).catch((err) => {
        console.log(err);
    });
});

app.get('/admin/remove-image', (req,res) => {
    let fileName = req.query;
    collectionImages.remove(fileName).then(result => {
        let message = {
            success: true,
            message: 'Imagem removida com sucesso.' 
        }
        rename(
            path.normalize('./public/images/original-images/' + fileName.fileName), 
            path.normalize('./public/images/deleted-images/' + fileName.fileName), 
            (err) => {
            if(err) throw err;
            console.log('Imagem movida com sucesso');
        });
        return res.redirect(`/admin/images?success=${message.success}&message=${message.message}`);
    }).catch(err =>{
        console.log(err);
    });
});

app.get('/upload-images', (req, res) => {
    let message = req.query;
    return res.render('upload-images', {
        message : message,
    });
});

app.post('/images', upload.single('image'), (req, res) => {
    let originalName = req.file.originalname;
    let fileName =  req.file.filename;
    let phrase = req.body.phrase;
    let category = req.body.category;
    
    collectionPhrase.list({ phrase : phrase }).then(phrase => {
        if(phrase.length == 0){
            collectionPhrase.insert({
                phrase: phrase,
                category: category
            });
        } else {
            let result = {
                success: false,
                message: "Frase já existe"
            }
            return Promise.reject(result);
        }
    }).then(() => {
        collectionCategories.list({category : category})
        .then(category => {
            if(!category){
                collectionCategories.insert({
                    category : category
                })
            }
        });
    }).then(() => {
        collectionImages.insert({
            originalName: originalName, 
            fileName: fileName,
            category: category,
            phrase: phrase,
            enabled: true
        });
        let result = {
            success: true,
            message: "Imagem inserida com sucesso."
        }
        return res.redirect('/upload-images?success=false' +  result.success + '&message=' + result.message);
    }).catch(erro => {
        return res.redirect('/upload-images?success=false' +  erro.success + '&message=' + erro.message);
    });
});

app.listen(9090);