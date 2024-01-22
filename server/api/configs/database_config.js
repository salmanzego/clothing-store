const mongoose = require('mongoose')

const URI = process.env.MONGO_URI

const dbConnect = () => {
    mongoose.connect(URI).then(
        () => console.log('Db Connected'),
        err => { console.log(err) }
    );
}

module.exports = dbConnect