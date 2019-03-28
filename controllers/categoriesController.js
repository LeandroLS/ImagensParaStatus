const express = require('express');
const router = express.Router();
const app = require('../config/express');
const categoriesModel = require('../models/categoriesModel');
router.get('/categorias', async (req, res) => {
    let categorias = await app.locals.db.collection('Categories').find().toArray();
    let { token, message, success } = req.query;
    res.render('admin/categorias', {
        categorias : categorias,
        token : token,
        message: message,
        success : success
    });
});

router.post('/categories/description', async (req, res) => {
    let { categoryUrlName, description, token } = req.body;
    let retorno = categoriesModel.setDescription(description, categoryUrlName);
    if(retorno){
        return res.redirect(`/admin/categorias/?message=Descrição atualizada.&success=true&token=${token}`);
    } else {
        return res.redirect(`/admin/categorias/?message='Não foi possível atualizar descrição.&success=false&token=${token}`);
    }
});

module.exports = router;