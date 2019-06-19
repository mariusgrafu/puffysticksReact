const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  title : {
    type : String,
    default : ''
  },
  subTitle : {
      type : String,
      default : ''
  },
  content : {
    type : String,
    default : ''
  },
  cover : {
      type : String,
      default : ''
  },
  thumbnail : {
      type : String,
      default : ''
  },
  likes : {
      type : Number,
      default : 0
  },
  views : {
      type : Number,
      default : 0
  },
  featured : {
      type : Boolean,
      default : false
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
  catType : [String],
  tags : [
      {
          type : String,
          default : ''
      }
  ],
  showComments : {
      type : Boolean,
      default : true
  }

}, {collection : 'blogPosts'});


module.exports = mongoose.model('BlogPost', BlogPostSchema);
