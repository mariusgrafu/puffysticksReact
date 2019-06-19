const mongoose = require('mongoose');

const TermsSchema = new mongoose.Schema({
  title : {
    type : String,
    default : ''
  },
  key : {
    type : String,
    default : ''
  },
  content : {
    type : String,
    default : ''
  },
  lastUpdate: {
    type : Date,
    default : Date.now
  }
}, {collection : 'terms'});

module.exports = mongoose.model('Terms', TermsSchema);
