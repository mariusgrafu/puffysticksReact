const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  author : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User'
  },
  title : {
    type : String,
    default : ``
  },
  budget : {
    type : String,
    default : ``
  },
  type : {
    type : String,
    default : ``
  },
  content : {
    type : String,
    default : ``
  },
  state : {
    type : String,
    default : `pending`
  },
  replies : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'ContactReply'
  }],
  postDate: {
    type : Date,
    default : Date.now
  }
}, {collection : 'contactMessage'});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
