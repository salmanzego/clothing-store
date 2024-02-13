const bcrypt = require('bcryptjs');
const jwt = require('json-web-token');
const UserModel = require('../models/user.model');
const CartModel = require('../models/cart.model');
const ProductModel = require('../models/product.model');
const mongoose = require('mongoose');
const adminHelper = require("./adminHelper");

module.exports = {
    createUser: (user) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(user.password, 9, async (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    user.password = hash;
                    const newUser = new UserModel(user);
                    const dbUser = await newUser.save();

                    if (dbUser) {
                        const payLoad = {
                            _id: dbUser._id,
                            userName: dbUser.userName,
                            email: dbUser.email,
                            isAdmin: false
                        }
                        jwt.encode(process.env.USER_JWT_KEY, payLoad, (err, token) => {
                            if (err) {
                                reject({ msg: 'Some error on storing cookies' });
                            } else {
                                resolve({ msg: 'account created successfully', redirectTo: '/', token: token });
                            }
                        });
                    } else {
                        reject({ msg: 'Some error on creating new account' });
                    }
                }
            })
        })
    },
    doLogin: (userDetails) => {
        return new Promise(async (resolve, reject) => {
            const user = await UserModel.findOne({ email: userDetails.email })
            if (user) {
                bcrypt.compare(userDetails.password, user.password).then((res) => {
                    if (res) {
                        const payLoad = {
                            _id: user._id,
                            email: user.email,
                            userName: user.userName,
                            isAdmin: false
                        }
                        jwt.encode(process.env.USER_JWT_KEY, payLoad, (err, token) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(token);
                            }
                        });
                    } else {
                        reject("Incorrect Password");
                    }
                }).catch((err) => {
                    reject(err);
                });
            } else {
                reject("Email not Found");
            }
        })
    },
    addToCart: (prodId, userId) => {
        let prodObj = {
            _id: new mongoose.Types.ObjectId(prodId),
            quantity: 1
        }
        console.log(prodObj);
        return new Promise(async (resolve, reject) => {
            const cart = await CartModel.findOne({ customerId: userId });
            const product = await ProductModel.findById(prodId);
            if (!product) {
                reject({ msg: 'Product not found!' });
            }
            if (cart) {
                const prodIndex = cart.products.findIndex(product => product._id == prodId);
                if (prodIndex > -1) {
                    console.log("p");
                    CartModel.updateOne({ "customerId": userId, "products._id": prodId },
                        { $inc: { "products.$.quantity": 1 } }
                    ).then(docs => {
                        resolve({ msg: "quantity increased" });
                    }).catch(err => {
                        reject(err);
                    })
                } else {
                    CartModel.updateOne({ "customerId": userId },
                        { $push: { "products": prodObj } }
                    ).then(docs => {
                        resolve({ msg: "Added to Cart" });
                    }).catch(err => {
                        console.log(err);
                    })
                }
            } else {
                let cart = {
                    customerId: new mongoose.Types.ObjectId(userId),
                    products: [prodObj]
                };
                const newCart = new CartModel(cart);
                const dbCart = await newCart.save();
                if (dbCart) {
                    resolve({ msg: "Cart Created Successfully" });
                } else {
                    reject({ msg: "Can't Create Cart" });
                }
            }
        })
    },
    changeQuantity: (info) => {
        let count = parseInt(info.count);
        let quantity = parseInt(info.quantity);
        return new Promise(async (resolve, reject) => {

            if (quantity == 1 && count == -1) {
                console.log("deleting" + info.prodId);
                CartModel.updateOne({ customerId: new mongoose.Types.ObjectId(info.userId) },
                    { $pull: { products: { _id: new mongoose.Types.ObjectId(info.prodId) } } }
                ).then(docs => {
                    console.log(docs);
                    resolve({ msg: "Product Deleted" });
                }).catch(err => {
                    console.log(err);
                });
            } else {
                CartModel.updateOne({ "customerId": new mongoose.Types.ObjectId(info.userId), "products._id": new mongoose.Types.ObjectId(info.prodId) },
                    { $inc: { "products.$.quantity": count } }
                ).then(docs => {
                    resolve({ msg: "quantity changed" });
                }).catch(err => {
                    reject(err);
                })
            }

        })
    },
    getCart: (userId) => {
        return new Promise((resolve, reject) => {
            CartModel.aggregate()
                .match({ customerId: new mongoose.Types.ObjectId(userId) })
                .unwind("$products")
                .lookup({ "from": "productmodels", "localField": "products._id", "foreignField": "_id", "as": "product" })
                .unwind("$product")
                .project({
                    _id: 1,
                    customerId: 1,
                    product: {
                        $mergeObjects: [
                            "$product",
                            { quantity: "$products.quantity" }
                        ]
                    }
                })
                .group({
                    _id: "$_id",
                    products: { $push: "$product" },
                    totalAmount: { $sum: { $multiply: ["$product.price", "$product.quantity"] } }
                })
                .then(async (docs) => {

                    const products = await Promise.all(docs[0].products.map(async (product) => {
                        const imgUrl = await adminHelper.getProductImg(product.filename);
                        if (imgUrl) {
                            newProd = { ...product, imgUrl: imgUrl };
                        } else {
                            newProd = { ...product, imgUrl: '' };
                        }
                        return newProd;
                    }));
                    docs[0].products = products;
                    resolve(docs[0]);
                }).catch(err => {
                    reject(err);
                })
        })
    },
    deleteFromCart: (userId, prodId) => {
        return new Promise((resolve, reject) => {
            CartModel.updateOne({ customerId: new mongoose.Types.ObjectId(userId) },
                { $pull: { products: { _id: new mongoose.Types.ObjectId(prodId) } } }
            ).then(docs => {
                console.log(docs);
                resolve({ msg: "Product Deleted" });
            }).catch(err => {
                console.log(err);
            });
        })
    }
}