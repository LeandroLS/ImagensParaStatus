const mime = require('mime-types');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}.${mime.extension(file.mimetype)}`);
    }
});

const upload = multer({ storage });

module.exports = upload;