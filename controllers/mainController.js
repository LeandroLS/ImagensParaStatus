const app = require('../config/express');
const ObjectId = require('mongodb').ObjectID;

app.locals.imagesPerPage = 3;

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
    let header = 'Imagens Para Status';
    if(category) {
        header = `Imagens da categoria: ${category}`;
    }
    return header;
}

function calcNumberOfPages(qtdImages){
    let imagesPerPage = app.locals.imagesPerPage;
    return Math.ceil(qtdImages / imagesPerPage);
}

app.get('/privacidade', async (req, res) => {
    res.render('privacidade');
});

app.get('/sobre', async (req, res) => {
    let db = app.locals.db;
    let categories = await db.collection('Categories').find().toArray();
    res.render('sobre', { categories : categories});
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
            header : header,
            currentPage : 1
        });
    });
});

app.get('/:category?/page/:number', async (req, res) => {
    let db = app.locals.db;
    let { phrase } = req.query;
    var filter = {};
    var filterNumberOfPages = {};
    var header = getImagesCategoryHeader(category);
    if(req.params.category){
        var category = req.params.category;
        filterNumberOfPages.category = category;
        filter.category = category;
    }
    if(phrase){
        filterNumberOfPages.phrase = { $regex: `.*${phrase}.*`, $options:'i' };
        filter.phrase = { $regex: `.*${phrase}.*`, $options:'i' };
    }

    if(req.params.number){
        var pageNumber = req.params.number;
        var imagesArray = new Array();
        var i = 1 ;
        await db.collection('Images').find(filter).forEach(function (document) {
            document.id = i;
            imagesArray.push(document);
            i++;
        });
        function getMinAndMaxId(){
            let imagesPerPage = app.locals.imagesPerPage;
            let minId = (pageNumber * imagesPerPage) - imagesPerPage;
            let maxId = minId + imagesPerPage;
            return { maxId, minId };
        }
        
        function filterImagesPerLastId(value){
            let id = getMinAndMaxId();
            if(value.id > id.minId && value.id <= id.maxId){
                return value;
            }
        }
        var images = await imagesArray.filter(filterImagesPerLastId);
    }
    let numberOfPages = db.collection('Images').countDocuments(filterNumberOfPages).then(qtdImages => calcNumberOfPages(qtdImages));
    let categories = db.collection('Categories').find().toArray().then(categories => categories);
    Promise.all([categories, numberOfPages]).then(data => {
        return res.render('index', {
            images : images,
            categories : data[0],
            numberOfPages : data[1],
            currentPage : pageNumber,
            categoryPagination : category,
            header : header,
            phrase : phrase
        });
    });
});

app.get('/image/:id', async (req, res) => {
    let db = app.locals.db;
    let { id } = req.params;
    if(id.length < 12) {
        return res.render('404');
    }
    let images = await db.collection('Images').find({ _id : ObjectId(id) }).toArray();
    res.render('index', { images : images });
});