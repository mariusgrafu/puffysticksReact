const mongoose = require('mongoose');

const SiteSettingsSchema = new mongoose.Schema({
  siteOnline : {
    type : Boolean,
    default : true
  },
  defaultAvatars : [{
    type : String,
    default : 'https://i.imgur.com/WjVWTla.png'
  }],
  defaultCovers : [{
    type : String,
    default : 'https://i.imgur.com/xnjOROu.png'
  }],
  colors : [{
    type : mongoose.Schema.Types.Mixed,
    default : {
      key : 'default',
      value : {
        accent: '#8E3BEB',
        text: '#E9DFF7'
      }
    }
  }]
}, {collection : 'siteSettings'});

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
