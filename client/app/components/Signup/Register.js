import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import SignupHeader from './SignupHeader';
import Input from '../Input/Input';
import Checkbox from '../Input/Checkbox';

class Register extends TabPage {

  constructor(props){
    super(props);

    this.state = {
      inputs: [
        {
          name : 'displayName',
          label : 'display name',
          type : 'text',
          placeholder : 'my display name',
          info : {
            icon : true,
            content : `who people here will know you as around here. 
            must be between 3 and 20 characters!`
          },
          error : null,
          onChange : null
        },
        {
          name : 'username',
          label : 'username',
          type : 'text',
          placeholder : 'my username',
          info : {
            icon : true,
            content : `the username you'll use in order to sign in.
            might be a good idea for it to be different from the display name 🤔...
            must be between 3 and 20 characters!`
          },
          error : null,
          onChange : null
        },
        {
          name : 'email',
          label : 'email',
          type : 'text',
          placeholder : 'my email address',
          info : {
            icon : true,
            content : `the email address that will be associated to your account.`
          },
          error : null,
          onChange : null
        },
        {
          name : 'password',
          label : 'password',
          type : 'password',
          placeholder : 'my password',
          info : {
            icon : true,
            content : `the password you'll use in order to sign in.
            must be at least 6 characters long.`
          },
          error : null,
          onChange : null
        },
        {
          name : 'repassword',
          label : 're-type password',
          type : 'password',
          placeholder : 'retype password',
          info : {
            icon : true,
            content : `re-write the password you entered above.`
          },
          error : null,
          onChange : null
        }
      ],
      checkbox : {
        name : 'agree',
        label : [`i have read and i agree with the `,
         <Link to="/privacy">privacy policy</Link>,
         ` and the `,
          <Link to="/terms">terms of use</Link>]
      }
    }
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
    let {inputs, checkbox} = this.state;
    for(let i in inputs){
      inputs[i].error = errors[inputs[i].name]
    }
    checkbox.error = errors.checkbox;
    this.setState({inputs,checkbox});
  }

  resetErrors = () => {
    let {inputs, checkbox} = this.state;
    checkbox.error = null;
    for(let i in inputs){
      inputs[i].error = null;
    }
    this.setState({inputs, checkbox});
  }

  formSubmitted = (e) => {
    e.preventDefault();
    this.resetErrors();
    const parent = $('form[name="register"]');
    let data = {};
    let whatToFetch = ['displayName', 'username', 'email', 'password', 'repassword'];
    for(let it in whatToFetch){
      data[whatToFetch[it]] = parent.find(`input[name="${whatToFetch[it]}"]`).val();
    }
    data.policyTerms = false;
    if(parent.find('.checkbox[data-checked=true]').length) data.policyTerms = true;
    
    const {socket} = this.props;
    socket.emit('client > server registerAccount', data, this.serverAnswer);
  }

  render() {
    const {inputs} = this.state;
    const {checkbox} = this.state;

    return (
      <div className="signupContainer">
        <div className="signupWrap">
          <SignupHeader 
            title = "register"
            subtitle = "come join the cool kids"
          />
          <form name="register" onSubmit={this.formSubmitted}>
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
            <Checkbox 
              checkbox = {checkbox}
            />
            <input className="btn primary" type="submit" value="sign up" />
          </form>
        </div>
      </div>
    );
  }
}

export default Register;
