const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Preferences = require('./Preferences');

const UserSchema = new mongoose.Schema({
  displayName : {
    type : String,
    default : ''
  },
  username : {
    type : String,
    default : ''
  },
  email : {
    type : String,
    default : ''
  },
  password : {
    type : String,
    default : ''
  },
  group : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  preferences : {
    type : mongoose.Schema.Types.Mixed,
    default : new Preferences()
  },
  avatar : {
    type : String,
    default : ''
  },
  cover : {
    type : String,
    default : ''
  },
  userKey : {
    type : String,
    default : ''
  },
  isDeleted : {
    type : Boolean,
    default : false
  },
  signUpDate: {
    type : Date,
    default : Date.now
  }
});

UserSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
