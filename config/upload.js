const mime = require('mime-types');
const multer = require('multer');
const moment = require('moment');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/original-images');
    },
    filename: function (req, file, cb) {
        let { category, phrase, existentCategory } = req.body;
        category = category || existentCategory;
        cb(null, `${category}-${phrase.slice(0,25)}.${mime.extension(file.mimetype)}`);
    }
});

const upload = multer({ storage });

module.exports = upload;