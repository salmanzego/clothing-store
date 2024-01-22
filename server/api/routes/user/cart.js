const express = require('express');
const userHelper = require('../../helpers/userHelper');
const router = express.Router();

router.post('/',(req,res,next)=>{
    userHelper.addToCart()
    res.status(200).json({
        msg:'cart GET'
    });
})


module.exports = router;