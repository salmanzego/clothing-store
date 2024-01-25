const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema({
    customerId: { type: Schema.ObjectId, required: true },
    products: [{ _id: { type: Schema.ObjectId , required: true }, quantity: { type: Number , required: true } }]
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

