const app = require('./config/express');
app.get('/', (req, res) => {
    res.render('teste');
});
app.listen(8000);