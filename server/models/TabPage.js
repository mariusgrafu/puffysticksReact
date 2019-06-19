const mongoose = require('mongoose');

const TabPageSchema = new mongoose.Schema({
  pageKey : {
      Type : String,
      default : ''
  },
  title : {
      Type : String,
      default : ''
  },
  description : {
      type : String,
      default : ''
  },
  featuredItemsTitle : {
      type : String,
      default : ''
  },
  searchPlaceholder : {
      type : String,
      default : ''
  },
  followers : {
      type : Number,
      default : 0
  },
  categories : [{
      title : {
          type : String,
          default : ''
      },
      default : {
          type : Boolean,
          default : false
      },
      catKey : {
          type : String,
          default : ''
      }
  }]

}, {collection : 'tabPages'});

module.exports = mongoose.model('TabPage', TabPageSchema);
