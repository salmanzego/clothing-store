const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: { type: String, required: true },
    shortDesc: { type: String, required: true },
    desc: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true},
    filename: { type: String, required: true}
},{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    }
});

const ProductModel = mongoose.model('ProductModel', productSchema);
module.exports = ProductModel;