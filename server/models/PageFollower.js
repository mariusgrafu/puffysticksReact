const mongoose = require('mongoose');

const PageFollowerSchema = new mongoose.Schema({
    pageKey : String,
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    date : {
        type : Date,
        default : Date.now
    }

}, {collection : 'pageFollowers'});


module.exports = mongoose.model('PageFollower', PageFollowerSchema);
