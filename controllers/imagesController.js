const express = require('express'), router = express.Router();
const app = require('../config/express');
const SEOHelper = require('../libs/SEOHelper');
router.get('/image/:fileName', async (req, res) => {
    let db = app.locals.db;
    let { fileName } = req.params;
    let images = await db.collection('Images').find({ fileName : fileName }).toArray();
    let metaDescription = SEOHelper.getMetaDescription(images[0].category);
    let categories = await db.collection('Categories').find().toArray().then(categories => categories);
    let header = SEOHelper.getImagesCategoryHeader(images[0].category);
    let title = SEOHelper.getTitleDescription(images[0].category);
    let OGpropertiesFacebook = SEOHelper.facebookOGManipulator(images[0]);
    let relatedImages = await db.collection('Images').find({ '_id' : { $ne: images[0]._id }, category : images[0].category }).limit(6).toArray();
    let canonical = SEOHelper.geraCanonicalLink(req.originalUrl);
    res.render('single-image', { 
        images : images, 
        categories : categories, 
        header : header, 
        metaDescription : metaDescription,
        title : title,
        OGpropertiesFacebook : OGpropertiesFacebook,
        relatedImages : relatedImages,
        canonical : canonical
    });
});
module.exports = router;