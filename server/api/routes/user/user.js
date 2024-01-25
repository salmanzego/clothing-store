const express = require('express');
const router = express.Router();
const userHelper = require('../../helpers/userHelper');
const jwt = require('json-web-token');

const verifyUser = async (req, res, next) => {
    try {
        const cookie = req.cookies['userjwt'];
        jwt.decode(process.env.USER_JWT_KEY, cookie, (err, payload, header) => {
            if (err) {
                console.log("error");
                res.status(302).json({
                    redirectTo: '/login',
                    error: err
                })
            } else {
                const { password, ...data } = payload;
                req.user = data;
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

router.post('/signIn', (req, res) => {
    userHelper.createUser(req.body).then((result) => {
        res.status(200).json(result);
    }).catch((err) => {
        res.status(404).json({
            msg: err
        });
    })
})

router.post('/login', (req, res, next) => {
    if(req.cookies['userjwt']){
        res.status(302).json({
            redirectTo: '/'
        });
    }else{
        userHelper.doLogin(req.body).then((token) => {
            res.cookie('userjwt', token, {
                httpOnly: true,
                maxAge: 60 * 1000
            });
            res.status(302).json({
                msg: "Login Successfull",
                redirectTo: '/'
            });
        }).catch((err) => {
            res.status(404).json({
                msg: err
            });
        })
    }
    
})

module.exports = router;
module.exports.user = verifyUser;