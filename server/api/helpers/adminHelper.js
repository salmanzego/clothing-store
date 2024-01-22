const AdminModel = require('../models/admin.model');
const ProductModel = require('../models/product.model');
const bcrypt = require('bcryptjs');
const jwt = require('json-web-token');
const s3 = require('../configs/awsbucket_config');
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

module.exports = {
    doLogin: (user) => {
        return new Promise(async (resolve, reject) => {
            const admin = await AdminModel.findOne({ email: user.email })
            if (admin) {
                bcrypt.compare(user.password, admin.password).then((res) => {
                    if (res) {
                        const payLoad = {
                            _id: admin._id,
                            email: admin.email,
                            isAdmin: true
                        }
                        jwt.encode(process.env.ADM_JWT_KEY, payLoad, (err, token) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(token);
                            }
                        });
                    } else {
                        reject("Incorrect Password");
                    }
                })

            } else {
                reject("Email not Found");
            }
        })
    },
    addProduct: (product) => {
        return new Promise((resolve, reject) => {
            console.log(product);
            const prod = new ProductModel(product);
            prod.save().then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            })
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            const products = await ProductModel.find();
            if (products) {
                resolve(products);
            } else {
                reject({ msg: 'No Products Found' });
            }
        })
    },
    getProductById: (productId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await ProductModel.findById(productId);
                if (product) {
                    resolve(product);
                } else {
                    reject({ msg: 'No Products Found' });
                }
            } catch (err) {
                reject({ msg: 'No Products Found' });
            }
        })
    },
    uploadProductImg: (file) => {
        return new Promise(async (resolve, reject) => {
            if (!file) {
                reject({ msg: 'Minimum one image required!' });
            } else {
                const uKey = Date.now().toString(36) + Math.random().toString(36).substring(2) + '.jpg';
                const params = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: uKey,
                    Body: file.buffer
                };
                const command = new PutObjectCommand(params);
                result = await s3.send(command);
                result.filename = uKey;
                if (result) {
                    resolve(result);
                } else {
                    reject({ msg: 'Some Error on upload' });
                }
            }
        })
    },
    updateProductImg: (file, filename) => {
        return new Promise(async (resolve, reject) => {
            if (!file) {
                reject({ msg: 'Minimum one image required!' });
            } else {
                const params = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: filename,
                    Body: file.buffer
                };
                const command = new PutObjectCommand(params);
                result = await s3.send(command);
                if (result) {
                    resolve(result);
                } else {
                    reject({ msg: 'Some Error on upload' });
                }
            }
        })
    },
    getProductImg: (filename) => {
        return new Promise(async (resolve, reject) => {
            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: filename,
                ResponseContentType: 'image/jpeg'
            }
            const command = new GetObjectCommand(params);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            if (url) {
                resolve(url);
            } else {
                reject({ msg: 'Some Error on retrieving Image' });
            }
        })
    },
    updateProduct: (product) => {
        return new Promise(async (resolve, reject) => {
            const filter = { _id: product._id }
            const result = await ProductModel.findOneAndUpdate(filter, product, { new: true });
            console.log(result);
            if (result) {
                resolve({ ...result.toObject(), msg: 'Updated Successfully' });
            } else {
                reject({ msg: "Can't update product" });
            }
        })
    },
    deleteProduct: (prodId) => {
        return new Promise(async (resolve, reject) => {
            const result = await ProductModel.deleteOne({ _id: prodId });
            if (result.deletedCount > 0) {
                resolve({ msg: 'deleted successfully' });
            } else {
                reject({ msg: 'Error on deleting product' });
            }
        })
    }
}