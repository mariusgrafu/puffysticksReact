const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  content : {
    type : String,
    default : ''
  },
  visible : {
    type : Boolean,
    default : true
  },
  postDate : {
    type : Date,
    default : Date.now
  },
  author : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  postId : {
    type : mongoose.Schema.Types.ObjectId
  },
  pageId : {
    type : mongoose.Schema.Types.ObjectId
  },
  parentId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Comment'
  },
  edited : {
    isEdited : {
      type: Boolean,
      default : false
    },
    editTime : {
      type: Date,
      default : 0
    }
  }

});


module.exports = mongoose.model('Comment', CommentSchema);
