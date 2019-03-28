const app = require('../config/express');
app.locals.imagesPerPage = 15;
const SEOHelper = require('../libs/SEOHelper');
const paginationHelper = require('../libs/paginationHelper');
async function checkIfCategoryExists(req, res, next) {
    let { categoryUrlName } = req.params;
    let db = app.locals.db;
    if(typeof categoryUrlName === 'undefined'){
        return next();
    }
    let categories = await db.collection('Categories').find().toArray();
    let categoriesFilter = categories.filter(value => value.urlName == categoryUrlName);
    if(categoriesFilter.length >= 1){
        return next();
    } else {
        res.status(404);
        return res.render('404');
    }
}

function calcNumberOfPages(qtdImages){
    let imagesPerPage = app.locals.imagesPerPage;
    return Math.ceil(qtdImages / imagesPerPage);
}
app.get('/privacidade', async (req, res) => {
    let canonical = SEOHelper.geraCanonicalLink(req.originalUrl);
    res.render('privacidade', { canonical : canonical });
});

app.get('/sobre', async (req, res) => {
    let db = app.locals.db;
    let canonical = SEOHelper.geraCanonicalLink(req.originalUrl);
    let categories = await db.collection('Categories').find().toArray();
    res.render('sobre', { categories : categories, canonical : canonical });
});

app.get('/:categoryUrlName?', checkIfCategoryExists, async (req, res) => {
    let { phrase } = req.query;
    let { categoryUrlName } = req.params;
    let db = app.locals.db;
    var filter = {};
    if(categoryUrlName){
        var category = await db.collection('Categories').find({urlName : categoryUrlName}).toArray();
        filter = { category : category[0].category };
    }
    if(phrase){
        let palavras = phrase.split(" ");
        var regex = '';
        if(palavras.length == 1){
            regex = `(?=.*${palavras[0]})`;
        } else {
            regex = palavras.map(element => {
                return `(?=.*${element})`;
            }).join('');
        }
        filter = { phrase: {$regex: `^${regex}.+`, $options:'i'}};
    }
    let title = SEOHelper.getTitleDescription((category ? category[0].category : null ));
    let header = SEOHelper.getImagesCategoryHeader((category ? category[0].category : null ));
    let metaDescription = SEOHelper.getMetaDescription((category ? category[0].category : null ));
    let imagesPerPage = app.locals.imagesPerPage;
    let numberOfPages = await db.collection('Images').countDocuments(filter).then(qtdImages => calcNumberOfPages(qtdImages));
    let paginationNumbers = paginationHelper.getNumbersOfPagination(1,numberOfPages);
    let images = await db.collection('Images').find(filter).limit(imagesPerPage).sort({'_id' : -1}).toArray().then(images => images);
    let categories = await db.collection('Categories').find().sort({'name': -1}).toArray().then(categories => categories);
    let canonical = SEOHelper.geraCanonicalLink(req.originalUrl);
    Promise.all([images, categories]).then(data => {
        return res.render('index', {
            images : data[0],
            categories : data[1],
            categoryPagination : (category ? category[0].category : null ),
            categoryDescription : (category ? category[0].description : null ),
            phrase : phrase,
            header : header,
            metaDescription : metaDescription,
            title : title,
            canonical : canonical,
            paginationNumbers : paginationNumbers
        });
    });
});

app.get('/:category?/page/:number', async (req, res) => {
    let db = app.locals.db;
    let { phrase } = req.query;
    var filter = {};
    var filterNumberOfPages = {};
    var header = SEOHelper.getImagesCategoryHeader(category);
    let metaDescription = SEOHelper.getMetaDescription(category);
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
        await db.collection('Images').find(filter).sort({'_id' : -1}).forEach(function (document) {
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
    let numberOfPages = await db.collection('Images').countDocuments(filterNumberOfPages).then(qtdImages => calcNumberOfPages(qtdImages));
    let categories = db.collection('Categories').find().toArray().then(categories => categories);
    let canonical = SEOHelper.geraCanonicalLink(req.originalUrl);
    let paginationNumbers = paginationHelper.getNumbersOfPagination(pageNumber,numberOfPages);
    let title = SEOHelper.getTitleDescription((category ? category : null ));
    Promise.all([categories]).then(data => {
        return res.render('index', {
            images : images,
            categories : data[0],
            categoryPagination : category,
            header : header,
            phrase : phrase,
            canonical : canonical,
            metaDescription : metaDescription,
            title : title,
            paginationNumbers : paginationNumbers
        });
    });
});