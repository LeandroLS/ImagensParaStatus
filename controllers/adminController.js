const app = require('../config/express');
const jwt = require('jsonwebtoken');
const auth = require('../config/auth.json');
const crypto = require('crypto');
function verifyToken(req, res, next){
    let token = req.body.token || req.query.token;
    if(req.path == '/login' || req.path == '/auth' || req.path == '/upload-images') return next();
    jwt.verify(token, auth.secret, (err, decoded) =>{
        if (err) {
            if(process.env.AMBIENTE == 'production'){
                return res.redirect(301, 'https://' + req.headers.host + '/');
            } else {
                return res.redirect(301, 'http://' + req.headers.host + '/');
            }
        } 
        return next();
    });
}
app.use('/admin', verifyToken);
app.get('/admin/dashboard', (req,res) => {
    let { message, token } = req.query;
    return res.render('admin/dashboard', { message : message, token : token });
});
app.get('/admin/login', (req, res) => {
    let message = req.query.message;
    return res.render('admin/login', { message : message });
});
app.post('/admin/auth', (req, res) => {
    let { user, password } = req.body;
    let algorithm = 'aes256';
    let cipher = crypto.createCipher(algorithm, auth.secret);
    let encrypted = cipher.update(password, 'utf8', 'hex') + cipher.final('hex');
    if ( user != auth.user || encrypted != auth.password ){
        return res.redirect('/admin/login?message=Usuário ou senha inválidos.');
    }
    let token = jwt.sign({ user : auth.user }, auth.secret, { expiresIn: 30000 });
    return res.redirect('/admin/dashboard?message=Logado com sucesso.&token=' + token);
});

