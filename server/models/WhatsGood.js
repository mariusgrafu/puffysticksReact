const mongoose = require('mongoose');

const WhatsGoodSchema = new mongoose.Schema({
  title : {
    type : String,
    default : ''
  },
  description : {
    type : String,
    default : ''
  },
  button : {
      title : {
          type : String,
          default : ''
      },
      to : {
          type : String,
          default : '/'
      }
  },
  key : {
      type : String,
      default : ''
  }
}, {collection : 'whatsGood'});

module.exports = mongoose.model('WhatsGood', WhatsGoodSchema);
