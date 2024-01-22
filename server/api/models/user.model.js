const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
},{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    }
});

const UserModel = mongoose.model('UserModel', userSchema);
module.exports = UserModel;