const mongoose = require('mongoose');

const ContactReplySchema = new mongoose.Schema({
  author : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User'
  },
  contactMessageParent : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'ContactMessage'
  },
  content : {
    type : String,
    default : ``
  },
  staffMessage : {
    type : Boolean,
    default : false
  },
  postDate: {
    type : Date,
    default : Date.now
  }
}, {collection : 'contactReply'});

module.exports = mongoose.model('ContactReply', ContactReplySchema);
