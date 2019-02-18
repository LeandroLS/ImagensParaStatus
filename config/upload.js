const mime = require('mime-types');
const multer = require('multer');
const moment = require('moment');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${moment().format('DDMMYYYY-hh-mm-ss')}.${mime.extension(file.mimetype)}`);
    }
});

const upload = multer({ storage });

module.exports = upload;