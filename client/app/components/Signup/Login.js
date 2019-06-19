import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import SignupHeader from './SignupHeader';
import Input from '../Input/Input';

class Login extends TabPage {

  constructor(props){
    super(props);

    this.state = {
      inputs: [
        {
          name : 'username',
          label : 'username',
          type : 'text',
          placeholder : 'my username'
        },
        {  name : 'password',
          label : 'password',
          type : 'password',
          placeholder : 'my password'
        }
      ]};
  }

  serverAnswer = (err, data) => {
    switch(err){
      case 0:
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userKey", data.userKey);
        this.props.user.initData();
        break;
      case 1:
        this.updateErrors(data);
        break;
      case 2:
        this.props.addWarnMessage(data);
        break;
      default:
      this.props.addWarnMessage(`unknown error!`);
    }
  }

  updateErrors = (errors) => {
    let {inputs} = this.state;
    for(let i in inputs){
      inputs[i].error = errors[inputs[i].name]
    }
    this.setState({inputs});
  }

  resetErrors = () => {
    let {inputs} = this.state;
    for(let i in inputs){
      inputs[i].error = null;
    }
    this.setState({inputs});
  }

  formSubmitted = (e) => {
    e.preventDefault();
    this.resetErrors();
    const parent = $('form[name="login"]');
    let data = {};
    let whatToFetch = ['username', 'password'];
    for(let it in whatToFetch){
      data[whatToFetch[it]] = parent.find(`input[name="${whatToFetch[it]}"]`).val();
    }
    
    const {socket} = this.props;
    socket.emit('client > server loginAccount', data, this.serverAnswer);
  }

  render() {
    const {inputs} = this.state;

    return (
      <div className="signupContainer">
        <div className="signupWrap">
          <SignupHeader 
            title = "log in"
            subtitle = "welcome back"
          />
          <form name="login" onSubmit={this.formSubmitted} >
            {
              inputs.map( (input, i) => {
                return(
                  <Input
                    input = {input}
                    key = {i}
                  />
                );
              })
            }
            <input className="btn primary" type="submit" value="sign in" />
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
