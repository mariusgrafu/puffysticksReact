const mongoose = require('mongoose');

const UserNotificationsSchema = new mongoose.Schema({
  type: {
    type : String,
    default : ''
  },
  user : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User'
  },
  content : {
    type : mongoose.Schema.Types.Mixed,
    default : {}
  },
  postDate: {
    type : Date,
    default : Date.now
  },
  seen : {
    type : Boolean,
    default : false
  }
}, {collection : 'userNotifications'});

module.exports = mongoose.model('UserNotifications', UserNotificationsSchema);
