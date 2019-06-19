const mongoose = require('mongoose');

const SocialLinkSchema = new mongoose.Schema({
  title : {
    type : String,
    default : ''
  },
  address : {
      external : {
          type : Boolean,
          default : true
      },
      link : {
          type : String,
          default : '/'
      }
  },
  key : {
      type : String,
      default : ''
  }
}, {collection : 'socialLinks'});

module.exports = mongoose.model('SocialLink', SocialLinkSchema);
