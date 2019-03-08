const app = require('../config/express');
app.locals.imagesPerPage = 1;
async function checkIfCategoryExists(req, res, next) {
    let { category } = req.params;
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
        header = `Imagens da categoria: ${category}`;
    }
    return header;
}

function calcNumberOfPages(qtdImages){
    let imagesPerPage = app.locals.imagesPerPage;
    return Math.ceil(qtdImages / imagesPerPage);
}

app.get('/privacidade', (req, res) => {
    res.render('privacidade');
});
app.get('/:category?', checkIfCategoryExists, async (req, res) => {
    let { phrase } = req.query;
    let { category } = req.params;
    var filter = {};
    if(category){
        filter = { category : category };
    }
    if(phrase){
        filter = { phrase: {$regex: `.*${phrase}.*`, $options:'i'}};
    }
    let header = getImagesCategoryHeader(category);
    let imagesPerPage = app.locals.imagesPerPage;
    let db = app.locals.db;
    let numberOfPages = await db.collection('Images').countDocuments(filter).then(qtdImages => calcNumberOfPages(qtdImages));
    let images = await db.collection('Images').find(filter).limit(imagesPerPage).toArray().then(images => images);
    let categories = await db.collection('Categories').find().toArray().then(categories => categories);
    Promise.all([numberOfPages, images, categories]).then(data => {
        return res.render('index', {
            numberOfPages : data[0],
            images : data[1],
            categories : data[2],
            categoryPagination : category,
            phrase : phrase,
            header : header
        });
    });
});

app.get('/:category?/page/:number', (req, res) => {
    let imagesPerPage = app.locals.imagesPerPage;
    let { phrase } = req.query;
    var filter = {};
    var filterNumberOfPages = {};
    if(req.params.number){
        var pageNumber = req.params.number;
        filter.id = { $gt : parseInt((pageNumber * imagesPerPage) - imagesPerPage) };
        if(req.params.category){
            var category = req.params.category;
            var header = getImagesCategoryHeader(category);
            filterNumberOfPages.category = category;
            filter.category = category;
        }
        if(phrase){
            filter.phrase = { $regex: `.*${phrase}.*`, $options:'i' };
            filterNumberOfPages.phrase = { $regex: `.*${phrase}.*`, $options:'i' };
        }
    }
    let db = app.locals.db;
    let numberOfPages = db.collection('Images').countDocuments(filterNumberOfPages).then(qtdImages => calcNumberOfPages(qtdImages));
    let images = db.collection('Images').find(filter).limit(imagesPerPage).toArray().then(images => images);
    let categories = db.collection('Categories').find().toArray().then(categories => categories);
    Promise.all([images, categories, numberOfPages]).then(data => {
        return res.render('index', {
            images : data[0],
            categories : data[1],
            numberOfPages : data[2],
            categoryPagination : category,
            header : header,
            phrase : phrase
        });
    });
});
