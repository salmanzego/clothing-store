const express = require('express');
const router = express.Router();
const adminHelper = require('../../helpers/adminHelper');
var verifyAdmin = require('./admin');
verifyAdmin = verifyAdmin.admin;

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get('/', verifyAdmin, (req, res, next) => {
    adminHelper.getAllProducts().then(async (products) => {
        const prods = await Promise.all(products.map(async (product) => {
            const imgUrl = await adminHelper.getProductImg(product.filename);
            if(imgUrl){
                newProd = { ...product.toJSON(), imgUrl: imgUrl };
            }else{
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

router.get('/:id', verifyAdmin, (req, res, next) => {
    adminHelper.getProductById(req.params.id).then(async (product)=>{
        const imgUrl = await adminHelper.getProductImg(product.filename);
        let prods;
        if(imgUrl){
            prods = { ...product.toJSON(), imgUrl: imgUrl };
        }else{
            prods = { ...product.toJSON(), imgUrl: '' };
        }
        res.status(200).json(prods);
    }).catch(err =>{
        res.status(404).json({
            msg: err
        });
    })
});

router.post('/', verifyAdmin, upload.single('productImg'), async (req, res) => {
    console.log(req.body);
    adminHelper.uploadProductImg(req.file).then((result) => {
        console.log(result);
        req.body.filename = result.filename;
        adminHelper.addProduct(req.body).then((product) => {
            res.status(200).json(product);
        }).catch(err => {
            res.status(404).json(err);
        })
    }).catch(err => {
        res.status(404).json(err);
    })
});

router.post('/edit-product/:id', upload.single('productImg'), verifyAdmin, (req,res,next)=>{
    req.body._id = req.params.id;
    if(req.file){
        adminHelper.updateProductImg(req.file,req.body.filename).then((result) => {
            console.log(result);
            adminHelper.updateProduct(req.body).then((product) => {
                res.status(200).json(product);
            }).catch(err => {
                res.status(404).json(err);
            })
        }).catch(err => {
            res.status(404).json(err);
        })
    }else{
        adminHelper.updateProduct(req.body).then((product) => {
            res.status(200).json(product);
        }).catch(err => {
            res.status(404).json(err);
        })
    }
});
//65a2d2d4451ff8afd2097f4b
router.post('/delete-product/:id', verifyAdmin, (req,res,next)=>{
    adminHelper.deleteProduct(req.params.id).then(result =>{
        res.status(200).json(result);
    }).catch(err =>{
        res.status(404).json(err);
    })
})

module.exports = router;