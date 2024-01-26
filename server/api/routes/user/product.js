const express = require('express');
const router = express.Router();
const adminHelper = require('../../helpers/adminHelper');

var verifyUser = require('./user');
verifyUser = verifyUser.user;


router.get('/', (req, res, next) => {
    adminHelper.getAllProducts().then(async (products) => {
        const prods = await Promise.all(products.map(async (product) => {
            const imgUrl = await adminHelper.getProductImg(product.filename);
            if (imgUrl) {
                newProd = { ...product.toJSON(), imgUrl: imgUrl };
            } else {
                newProd = { ...product.toJSON(), imgUrl: '' };
            }
            return newProd;
        }));
        res.status(200).json(prods);
    }).catch(err => {
        res.status(404).json({
            msg: err
        });
    });
});

router.get('/:id', (req, res, next) => {
    adminHelper.getProductById(req.params.id).then(async (product) => {
        const imgUrl = await adminHelper.getProductImg(product.filename);
        let prods;
        if (imgUrl) {
            prods = { ...product.toJSON(), imgUrl: imgUrl };
        } else {
            prods = { ...product.toJSON(), imgUrl: '' };
        }
        res.status(200).json(prods);
    }).catch(err => {
        res.status(404).json({
            msg: err
        });
    })
});


module.exports = router;