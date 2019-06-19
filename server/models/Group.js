const mongoose = require('mongoose');
const Permission = require('./Permission');

const GroupSchema = new mongoose.Schema({
  name : {
    type : String,
    default : ''
  },
  isDefault : {
    type : Boolean,
    default : false
  },
  isStaff : {
    type : Boolean,
    default : false,
  },
  permissions : {
    type : mongoose.Schema.Types.Mixed,
    default : new Permission()
  },
  createdDate : {
    type : Date,
    default : Date.now
  }
});

module.exports = mongoose.model('Group', GroupSchema);
