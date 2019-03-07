const app = require('../config/express');
async function checkIfCategoryExists(req, res, next) {
    let  { category } = req.params;
    if(typeof category === 'undefined'){
        return next();
    }
    let db = app.locals.db;
    let categories = await db.collection('Categories').find().toArray();
    let categoriesFilter = categories.filter(value => value.category == category);
    if(categoriesFilter.length >= 1){
        return next();
    } else {
        return res.render('404');
    }
}
function getImagesCategoryHeader(category = null){
    let header = 'Imagens';
    if(category) {
        header = `Imagens da categoria ${category}`;
    }
    return header;
}
app.get('/privacidade', (req, res) => {
    res.render('privacidade');
});
app.get('/:category?', checkIfCategoryExists, async (req, res) => {
    let { category } = req.params;
    var filter = {};
    if(category){
        filter = { category : category };
    }
    let header = getImagesCategoryHeader(category);
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
        });
    });
});

app.get('/:category?/page/:number', (req, res) => {
    let header = getImagesCategoryHeader(category);
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
            categoryPagination : category,
            header : header
        });
    });
});

app.get('/search/phrase', (req, res) => {
    let { phrase } = req.query;
    let db = app.locals.db;
    let imagesPerPage = app.locals.imagesPerPage;
    let header = getImagesCategoryHeader();
    let images = db.collection('Images').find({ phrase: {$regex: `.*${phrase}.*`, $options:'i'}}).limit(imagesPerPage).toArray().then(images => images);
    let categories = db.collection('Categories').find().toArray().then(categories => categories);
    let numberOfPages = db.collection('Images').countDocuments({ phrase: {$regex: `.*${phrase}.*`, $options:'i'}}).then(qtdImages => Math.floor(qtdImages / imagesPerPage));
    Promise.all([images, categories, numberOfPages]).then(data => {
        return res.render('index', {
            images : data[0],
            categories : data[1],
            numberOfPages : data[2],
            header : header
        });
    });
});
