import React, { Component } from 'react';
import Func from '../Classes/Func';
import { Link } from 'react-router-dom';

import Toggle from '../Helpers/Toggle';

class ProfilePassword extends Component {

  constructor(props){
    super(props);

    this.state = {
        password : '',
        newPassword : '',
        reNewPassword : '',
        errors : {
            password : (<></>),
            newPassword : (<></>),
            reNewPassword : (<></>)
        }
    }
  }

  submitResponse = (res) => {
      let {addWarnMessage} = this.props;
      if(!res.success && res.errors) {
        let errors = {
            password : (<></>),
            newPassword : (<></>),
            reNewPassword : (<></>)
        };
        if(res.errors.password.length)
            errors.password = (<div className="ppiError">{res.errors.password}</div>);
        if(res.errors.newPassword.length)
            errors.newPassword = (<div className="ppiError">{res.errors.newPassword}</div>);
        if(res.errors.reNewPassword.length)
            errors.reNewPassword = (<div className="ppiError">{res.errors.reNewPassword}</div>);

        this.setState({errors});
        return;
      }

      addWarnMessage(`password was successfully changed!`, 1);
  }

  submit = () => {
    const {user, socket} = this.props;
    let {password, newPassword, reNewPassword} = this.state;
    let errors = {
        password : (<></>),
        newPassword : (<></>),
        reNewPassword : (<></>)
    }
    let canDo = true;

    if(!password.length) {
        canDo = false;
        errors.password = (<div className="ppiError">you must enter your current password</div>);
    }

    if(newPassword.length < 6) {
        canDo = false;
        errors.newPassword = (<div className="ppiError">password must be at least 6 characters long!</div>);
    }

    if(reNewPassword.length && reNewPassword != newPassword) {
        canDo = false;
        errors.reNewPassword = (<div className="ppiError">passwords don't match!</div>);
    }

    this.setState({errors});

    if(canDo) {
        
        let data = {
            userData : user.getBasic(),
            password, newPassword, reNewPassword
        }

        socket.emit(`client > server changePassword`, data, this.submitResponse)
    }
  }

  render() {
    const {user, socket} = this.props;
    const {password, newPassword, reNewPassword} = this.state;
    const {errors} = this.state;

    return (
      <>
        <div className="profileSectionTitle">change my password</div>
        
        <div className="profilePassCont">
            <div className="profilePassInputWrap">
                <div className="ppiTitle">current password</div>
                <input type="password" value={password} onChange={e => this.setState({password : e.target.value})} />
                {errors.password}
            </div>
            <div className="profilePassInputWrap">
                <div className="ppiTitle">new password</div>
                <input type="password" value={newPassword} onChange={e => this.setState({newPassword : e.target.value})} />
                {errors.newPassword}
            </div>
            <div className="profilePassInputWrap">
                <div className="ppiTitle">repeat new password</div>
                <input type="password" value={reNewPassword} onChange={e => this.setState({reNewPassword : e.target.value})} />
                {errors.reNewPassword}
            </div>

            <div className="profilePassBtns">
                <div className="btn primary" onClick={this.submit}>submit</div>
            </div>
        </div>
      </>
    );
  }
}

export default ProfilePassword;
