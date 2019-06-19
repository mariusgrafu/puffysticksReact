const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    post : mongoose.Schema.Types.ObjectId,
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    date : {
        type : Date,
        default : Date.now
    },
    pageId : mongoose.Schema.Types.ObjectId

}, {collection : 'likes'});


module.exports = mongoose.model('Like', LikeSchema);
