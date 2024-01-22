const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema({
    customerId: { type: String, required: true },
    products: { type: Array, required: true}
},{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    }
});

const CartModel = mongoose.model('CartModel', cartSchema);
module.exports = CartModel;