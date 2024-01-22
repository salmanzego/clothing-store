const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    customerId: { type: String, required: true },
    orderDate: { type: String, required: true },
    orderStatus: { type: String, required: true },
    orderAmount: { type: Number, required: true },
    products: { type: Array, required: true}
},{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    }
});

const OrderModel = mongoose.model('OrderModel', orderSchema);
module.exports = OrderModel;