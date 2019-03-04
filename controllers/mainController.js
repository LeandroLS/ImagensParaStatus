const app = require('../config/express');
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
            return res.render('404');
        }
    });
}
app.get('/:category?', checkIfCategoryExists, (req, res) => {
    let { category } = req.params;
    let { token } = req.query;
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
            header : header,
            token : token
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
