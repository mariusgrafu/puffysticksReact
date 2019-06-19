const mongoose = require('mongoose');

const NavLinkSchema = new mongoose.Schema({
  title : {
    type : String,
    default : ''
  },
  address : {
      external : {
          type : Boolean,
          default : false
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
}, {collection : 'navLinks'});

module.exports = mongoose.model('NavLink', NavLinkSchema);
