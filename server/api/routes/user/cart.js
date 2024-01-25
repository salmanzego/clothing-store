const express = require('express');
const userHelper = require('../../helpers/userHelper');
const router = express.Router();


var verifyUser = require('./user');
verifyUser = verifyUser.user;

router.get('/', verifyUser, (req, res, next) => {
    userHelper.getCart(req.user._id).then((result) => {
        res.status(200).json(result);
    }).catch(err => {
        res.status(404).json(err)
    })
})

router.post('/:id', verifyUser, (req, res, next) => {
    userHelper.addToCart(req.params.id, req.user._id).then((result) => {
        res.status(200).json(result);
    }).catch(err => {
        res.status(404).json(err)
    })
})

router.post('/change-quantity/:id', verifyUser, (req, res, next) => {
    const info = {
        userId: req.user._id,
        prodId: req.params.id,
        count: req.body.count,
        quantity: req.body.quantity
    }
    userHelper.changeQuantity(info).then((result) => {
        res.status(200).json(result);
    }).catch(err => {
        res.status(404).json(err)
    })
})



module.exports = router;