class User{

  constructor(){
    this._id = null;
    this.displayName = '';
    this.username = '';
    this.avatar = '';
    this.avatar = '';
    this.userKey = null;
    this.signUpDate = 0;
    this.group = null;
    this.preferences = {};

    this.socket = null;
    this.update = null;
    this._ready = false;
  }

  initData = () => {
    this._id = localStorage.getItem('userId');
    this.userKey = localStorage.getItem('userKey');
    if(this._id != undefined && this.userKey != undefined){
      this.socket.emit(`client > server getUser`, {userId : this._id, userKey : this.userKey},
      (err, data) => {
        if(err){
          this._id = null;
          this.userKey = null;
          localStorage.removeItem('userId');
          localStorage.removeItem('userKey');
          this.update();
          return;
        }
        // let fields = ['displayName', 'username', 'avatar', 'signUpDate', 'group', 'email'];
        // for(let i in fields){
        //   this[fields[i]] = data[fields[i]];
        // }
        for(let k in data) this[k] = data[k];
        this._ready = true;
        this.update();
      });
    }else{
      this._id = null;
      this.userKey = null;
      this._ready = true;
      localStorage.removeItem('userId');
      localStorage.removeItem('userKey');
      this.update();
    }

  }

  getBasic = () => {
    return {
      userId : this._id,
      userKey : this.userKey
    }
  }

  logout = () => {
    this._id = null;
    this.userKey = null;
    this._ready = true;
    this.group = null;
    localStorage.removeItem('userId');
    localStorage.removeItem('userKey');
    this.update();
  }

  isLogged = () => {
    return (this._id != undefined && this._id != null && this.userKey != undefined && this.userKey != null);
  }

  isStaff = () => {
    return (this.group && this.group.isStaff);
  }

  getAvatar = () => {
    return this.avatar;
  }

  updatePrefs = (k, v) => {
    this.preferences[k] = v;
    
    let data = {
      userData : this.getBasic(),
      prefs : this.preferences
    }
    this.socket.emit(`client > server update user prefs`, data);
    // this.update();
  }

  changeAvatar = (newAvt) => {
    let data = {
      userData : this.getBasic(),
      avatar : newAvt
    };
    this.socket.emit(`client > server change user avatar`, data);
  }

  changeCover = (newCover) => {
    let data = {
      userData : this.getBasic(),
      cover : newCover
    };
    this.socket.emit(`client > server change user cover`, data);
  }

  canThey = (action) => {
    if(this.group && this.group.permissions){
        return this.group.permissions[`can_${action}`];
    }
    return false;
  }

}; 

export default User;
