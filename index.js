const app = require('./config/express');
require('./database/DataBase');
require('./controllers/adminController');
require('./controllers/mainController');
app.use(require('./controllers/imagesController'));
var port = process.env.PORT || 3000;
app.listen(port);