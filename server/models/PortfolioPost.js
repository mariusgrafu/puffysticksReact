const mongoose = require('mongoose');

const PortfolioPostSchema = new mongoose.Schema({
  title : {
    type : String,
    default : ''
  },
  subTitle : {
      type : String,
      default : ''
  },
  description : {
    type : String,
    default : ''
  },
  images : [{
      type : String,
      default : ''
  }],
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

}, {collection : 'portfolioPosts'});


module.exports = mongoose.model('PortfolioPost', PortfolioPostSchema);
