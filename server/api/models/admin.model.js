const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
    email:{type:String, required: true},
    password:{type:String, required: true}
},{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    }
});

const AdminModel = mongoose.model('AdminModel', adminSchema);
module.exports = AdminModel;