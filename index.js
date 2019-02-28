const app = require('./config/express');
const upload = require('./config/upload');
const { rename, unlink   } = require('fs');
const DB = require('./database/DB');
const path = require('path');
const collectionImages = new DB('Images');
const collectionPhrase = new DB('Phrases');
const collectionCategories = new DB('Categories');

function checkIfCategoryExists(req, res, next) {
    let category = req.params.category;
    if(typeof category === 'undefined'){
        return next();
    }

    collectionCategories.list().then(categories => {
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
    var filter = {};
    if(category) {
        filter = { category : category };
        header = `Imagens de ${category}.`;  
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

app.get('/page/:number', (req, res) => {
    let imagesPerPage = 1;
    collectionImages.count().then(imagesQtd => {
        let numberOfPages = imagesQtd / imagesPerPage;
        collectionImages.list({}, imagesPerPage)
        .then(images => {
            collectionCategories.list().then(categories => {
                console.log(numberOfPages);
                return res.render('index', {
                    images : images,
                    categories : categories,
                    numberOfPages : numberOfPages
                });
            });
        });
    });
   
});

app.get('/search/phrase', (req, res) => {
    let query = req.query;
    let phrase = query.phrase;
    collectionImages.list({ phrase: {$regex: `.*${phrase}.*`, $options:"i"}})
    .then(images => {
        console.log(images);
        return images
    }).then(images => {
        collectionCategories.list().then(categories => {
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
        return res.redirect('admin/upload-images?success=' +  result.success + '&message=' + result.message);
    }).catch(erro => {
        unlink(path.normalize('./public/images/original-images/' + fileName), (err) => {
            if(err) console.log(err);
            console.log('Arquivo removido');
        })
        return res.redirect('admin/upload-images?success=false&message=' + erro.message);
    });
});

app.listen(9090);