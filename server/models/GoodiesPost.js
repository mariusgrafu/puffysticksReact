const mongoose = require('mongoose');

const GoodiesPostSchema = new mongoose.Schema({
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
  catType : [String],
  tags : [
      {
          type : String,
          default : ''
      }
  ],
  releaseDate : {
      visible : {
          type : Boolean,
          default : true
      },
      value : {
          type : Date
      }
  },
  updateDate : {
      visible : {
          type : Boolean,
          default : true
      },
      value : {
          type : Date
      }
  },
  version : {
      type : String,
      default : ''
  },
  platform : [
      {
          type : String
      }
  ],
  showAlsoOnPlatform : {
      type : Boolean,
      default : true
  },
  showComments : {
      type : Boolean,
      default : true
  },
  allowBugReport : {
      type : Boolean,
      default : true
  },
  downloadUrl : {
      type : String,
      default : ''
  },
  showChangelog : {
    type: Boolean,
    default: false
  },
  changelog : {
      type : mongoose.Schema.Types.ObjectId
  }

}, {collection : 'goodiesPosts'});


module.exports = mongoose.model('GoodiesPost', GoodiesPostSchema);
