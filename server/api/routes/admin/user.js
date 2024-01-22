const express = require('express');
const router = express.Router();

router.get('/',(req,res,next)=>{
    res.status(200).json({
        msg:'Admin user GET'
    });
})


module.exports = router;