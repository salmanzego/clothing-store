const express = require('express');
const router = express.Router();
const jwt = require('json-web-token');
const adminHelper = require('../../helpers/adminHelper');

const verifyAdmin = async (req, res, next) => {
    try {
        const cookie = req.cookies['admjwt'];
        jwt.decode(process.env.ADM_JWT_KEY, cookie, (err, payload, header) => {
            if (err) {
                res.status(302).json({
                    redirectTo: '/login',
                    error: err
                })
            } else {
                const { password, ...data } = payload;
                req.admin = data;
                next();
            }
        })
    } catch (err) {
        res.status(302).json({
            redirectTo: '/login',
            err: err
        })
    }
}


router.post('/login', (req, res, next) => {
    adminHelper.doLogin(req.body).then((token) => {
        res.cookie('admjwt', token, {
            httpOnly: true,
            maxAge: 60 * 1000
        })
        res.status(302).json({
            msg: "Login Successfull",
            redirectTo: '/'
        })
    }).catch((err) => {
        res.status(404).json({
            msg: err
        })
    })
})
router.get('/', verifyAdmin, (req, res, next) => {
    res.status(200).json(req.admin);
})




module.exports = router;
module.exports.admin = verifyAdmin;