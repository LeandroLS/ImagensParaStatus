const app = require('./config/express');
const upload = require('./config/upload');
const util = require('./libs/util');
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
    return res.render('upload-images');
});

app.post('/images', upload.single('image'), (req, res) => {
    if(req.file){
        let originalName = req.file.originalname;
        let fileName =  req.file.filename;
        let phrase = req.body.phrase;
        let category = req.body.category;
        util.checkIfDataExists(phrase, category).then((result) => {
            if(result.success){
                let imagePromise = collectionImages.insert({
                    originalName: originalName, 
                    fileName: fileName,
                    category: category,
                    phrase: phrase,
                    enabled: true
                });
                
                let phrasePromise = collectionPhrase.insert({
                    phrase: phrase,
                    category: category
                });
        
                let categoryPromise = collectionCategories.insert({
                    category : category
                })
                Promise.all([imagePromise, phrasePromise, categoryPromise]).then(data =>{
                    return res.redirect(301,'upload-images');
                }).catch((err)=>{
                    if(err) return res.redirect(301,'upload-images');
                });
            } else {
                return res.redirect(301,'upload-images');
            }
        });
    }
    return res.redirect(301,'upload-images');
});

app.listen(9090);