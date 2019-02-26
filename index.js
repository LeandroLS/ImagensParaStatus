const app = require('./config/express');
const upload = require('./config/upload');
const { rename } = require('fs');
const DB = require('./database/DB');
const path = require('path');
const collectionImages = new DB('Images');
const collectionPhrase = new DB('Phrases');
const collectionCategories = new DB('Categories');

app.get('/:category?', (req, res) => {
    let category = req.params.category;
    let header = "Imagens.";
    if(category) {
        var filter = { category : category };
        header = `Imagens de ${category}.`;  
    } else {
        var filter = {};
    }
    collectionImages.list(filter).then(images => {
        return images;
    }).then(images => {
        collectionCategories.list().then(categories => {
            return res.render('index', {
                images : images,
                categories : categories,
                header : header
            });
        });
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
    }).then(()=>{
        collectionPhrase.updateOne(fileName, {$set: {fileName: ""} });
    }).catch(err =>{
        let message = {
            success: false,
            message: "Algo deu errado."
        }
        return res.redirect(`/admin/images?success=${message.success}&message=${message.message}`);
    });
});

app.get('/admin/upload-images', (req, res) => {
    let message = req.query;
    collectionCategories.list().then(categories => {
        return res.render('admin/upload-images', {
            message : message,
            categories : categories
        });
    })
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

    collectionPhrase.list({ phrase : phrase }).then(phraseResult => {
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
        collectionCategories.list({category : category})
        .then(categoryResult => {
            if(categoryResult.length == 0){
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
            phrase: phrase
        });
        let result = {
            success: true,
            message: "Imagem inserida com sucesso."
        }
        return res.redirect('admin/upload-images?success=false' +  result.success + '&message=' + result.message);
    }).catch(erro => {
        return res.redirect('admin/upload-images?success=false' +  erro.success + '&message=' + erro.message);
    });
});

app.listen(9090);