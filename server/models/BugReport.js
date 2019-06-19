const mongoose = require('mongoose');

const BugReportSchema = new mongoose.Schema({
  title : {
    type : String,
    default : ''
  },
  postDate : {
      type : Date,
      default : Date.now
  },
  author : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User'
  },
  state : {
      type : Number,
      default : 0
  },
  goodieId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'GoodiesPost',
    default : undefined
  },
  description : {
    type : String,
    default : ''
  }

}, {collection : 'bugReports'});


module.exports = mongoose.model('BugReport', BugReportSchema);
