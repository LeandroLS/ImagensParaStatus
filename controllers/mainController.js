const app = require('../config/express');

app.locals.imagesPerPage = 15;

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

function getImagesCategoryHeader(category = null){
    let header = 'Imagens Para Compartilhar';
    if(category) {
        header = `Imagens relacionadas a ${category}`;
    }
    return header;
}

function getTitleDescription(category = null){
    let title = 'Imagens Para Status. Diversas imagens para compartilhar nos status do whatsapp, facebook, pinterest e etc! :D';
    if(category) {
        title = `Imagens com frases de ${category} para compartilhar nos status do whatsapp, facebook, pinterest e etc! :D`;
    }
    return title;
}

function facebookOGManipulator(image){
    let OGproperties = {};
    OGproperties.url = 'https://imagensparastatus.com.br/image/' + encodeURIComponent(image.fileName);
    OGproperties.title = 'Imagens Para Status - Diversas imagens para compartilhar nos status do whatsapp, facebook, pinterest e etc!';
    OGproperties.description = image.phrase;
    OGproperties.image = 'https://imagensparastatus.com.br/images/original-images/' + encodeURIComponent(image.fileName);
    return OGproperties;
}
function getMetaDescription($category = null){
    var description = '';
    if($category){
        description = `Imagens para compartilhar nos status do whatsapp, facebook, pinterest relacionadas a ${$category}`;
    } else {
        description = 'Imagens Para Status. Diversas imagens para compartilhar nos status do whatsapp, facebook, pinterest e etc! :D';
    }
    return description;
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
        filter = { phrase: {$regex: `.*${phrase}.*`, $options:'i'}};
    }
    let title = getTitleDescription((category ? category[0].category : null ));
    let header = getImagesCategoryHeader((category ? category[0].category : null ));
    let metaDescription = getMetaDescription((category ? category[0].category : null ));
    let imagesPerPage = app.locals.imagesPerPage;
    let numberOfPages = await db.collection('Images').countDocuments(filter).then(qtdImages => calcNumberOfPages(qtdImages));
    let images = await db.collection('Images').find(filter).limit(imagesPerPage).sort({'_id' : -1}).toArray().then(images => images);
    let categories = await db.collection('Categories').find().toArray().then(categories => categories);
    Promise.all([numberOfPages, images, categories]).then(data => {
        return res.render('index', {
            numberOfPages : data[0],
            images : data[1],
            categories : data[2],
            categoryPagination : category,
            phrase : phrase,
            header : header,
            currentPage : 1,
            metaDescription : metaDescription,
            title : title
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

app.get('/image/:fileName', async (req, res) => {
    let db = app.locals.db;
    let { fileName } = req.params;
    var header = getImagesCategoryHeader();
    let title = getTitleDescription();
    let images = await db.collection('Images').find({ fileName : fileName }).toArray();
    let metaDescription = `Imagem para status. Frase: ${images[0].phrase}`;
    let categories = await db.collection('Categories').find().toArray().then(categories => categories);
    let OGpropertiesFacebook = facebookOGManipulator(images[0]);
    res.render('single-image', { 
        images : images, 
        categories : categories, 
        header : header, 
        metaDescription : metaDescription,
        title : title,
        OGpropertiesFacebook : OGpropertiesFacebook
    });
});