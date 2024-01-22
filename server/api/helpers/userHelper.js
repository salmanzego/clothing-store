const bcrypt = require('bcryptjs');
const jwt = require('json-web-token');
const UserModel = require('../models/user.model');

module.exports = {
    createUser: (user) => {
        return new Promise((resolve, reject) => {
            console.log(user.password);
            bcrypt.hash(user.password, 9, async (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    user.password = hash;
                    const newUser = new UserModel(user);
                    const dbUser = await newUser.save();
                    console.log(dbUser);
                    if (dbUser) {
                        resolve({ msg: 'account created successfully', user: dbUser });
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
    }
}