const app = require('./config/express');
const upload = require('./config/upload');
// const util = require('./libs/util');
const DB = require('./database/DB');
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

app.get('/dashboard', (req,res) => {
    return res.render('dashboard/dashboard');
});

app.get('/dashboard/images', (req,res) => {
    let images = collectionImages.list();
    images.then((images) => {
        return res.render('dashboard/dashboard-images', {
            images : images
        });
    }).catch((err) => {
        return res.render('dashboard-images');
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
        if(!phrase){
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