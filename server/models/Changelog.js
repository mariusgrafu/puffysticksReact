const mongoose = require('mongoose');

const ChangelogSchema = new mongoose.Schema({
  title : {
    type : String,
    default : ''
  },
  versions : {
    type : Array
  },
  goodieId : {
    type : String,
    default : undefined,
    ref : 'GoodiesPost'
  },
  postDate : {
    type : Date,
    default : Date.now
  },
  isMain : {
    type : Boolean,
    default : false
  }

}, {collection : 'changelog'});


module.exports = mongoose.model('Changelog', ChangelogSchema);
