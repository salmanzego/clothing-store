
const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const dotenv =  require('dotenv');


app.use(cors({
    credentials : true,
    origin:["*"]
}));

dotenv.config();

const dbConnect = require('./api/configs/database_config');
dbConnect();

const adminRoutes = require('./api/routes/admin/admin');
const userRoutes = require('./api/routes/user/user');
const productRoutes = require('./api/routes/user/product');
const orderRoutes = require('./api/routes/user/order');
const cartRoutes = require('./api/routes/user/cart');
const admProdRoutes = require('./api/routes/admin/product');
const admOrderRoutes = require('./api/routes/admin/order');
const admUserRoutes = require('./api/routes/admin/user');

app.use(cookieParser());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/cart',cartRoutes);
app.use('/api/admin/products', admProdRoutes);
app.use('/api/admin/orders', admOrderRoutes);
app.use('/api/admin/users', admUserRoutes);


module.exports = app ;