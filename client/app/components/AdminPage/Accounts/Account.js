import React, { Component } from 'react';
import Func from '../../Classes/Func';
import Dropdown from '../../Helpers/Dropdown';

import {
    Link,
    Redirect
  } from 'react-router-dom';


class Account extends Component {

  constructor(props){
    super(props);

    this.state = {
      account : null,
      editing : false,
      groups : []
    }
  }

  refreshAccount = () => {
    const {account} = this.props;
    const {groups} = this.state;
    let cAccount = $.extend(true,{}, account);
    this.setState({account : cAccount});
    if(groups && groups.length) {
      for(let i = 0; i < groups.length; ++i) {
        if(groups[i]._id == account.group._id){
          groups[i].selected = true;
        }else {
          groups[i].selected = false;
        }
      }
    }
    this.setState({groups});
  }

  updateGroups = (groups) => {
    if(!groups || !groups.length) return;
    const {account} = this.props;
    groups.map( (group) => {
      group.title = group.name;
      group.key = group._id;
      group.selected = false;
      if(group._id == account.group._id) group.selected = true;
    });

    this.setState({groups});
  }

  componentDidMount() {
    const {socket} = this.props;

    socket.emit(`client > server get groups`, this.updateGroups);
    this.refreshAccount();
  }

  updateAccountGroup = (grId) => {
    let {account} = this.state;
    account.group._id = grId;
    this.setState({account});
  }

  updateAccountAttr = (k, v) => {
    let {account} = this.state;
    account[k] = v;
    this.setState({account});
  }

  selectGroup = (groups) => {
    for(let i in groups) {
      if(groups[i].selected == true) {
        this.updateAccountGroup(groups[i]._id);
        break;
      }
    }
  }

  cancelEdit = () => {
    this.refreshAccount();
    this.setState({editing : false});
  }

  submitEdit = () => {
    const {account} = this.state;
    const {user, socket} = this.props;

    let data = {
      userData : user.getBasic(),
      account
    }

    socket.emit(`client > server edit account`, data);
    
    this.setState({editing : false});
  }

  render() {
    const {account, editing, groups} = this.state;

    if(!account) return (<></>);

    if(editing) {
      return (
      <div className="apaAccountWrap editing">
        <div className="apaaInputWrap">
          <div className="apaaiTitle">display name</div>
          <input type="text" value={account.displayName} onChange = {(e) => this.updateAccountAttr('displayName', e.target.value)} />
        </div>
        <div className="apaaInputWrap">
          <div className="apaaiTitle">group</div>
          <Dropdown
          options = {groups}
          update = {this.selectGroup}
          />
        </div>
        <div className="apaaBtns">
          <div className="btn primary" onClick={this.submitEdit} >save</div>
          <div className="btn" onClick={this.cancelEdit} >cancel</div>
        </div>
      </div>
      );
    }

    return (
      <>
      <div className="apaAccountWrap">
        <div className="apaAcc">
          <div className="apaAccAvt" style={{backgroundImage : `url(${account.avatar})`}} />
          <div className="apaAccDetails">
            <div className="apaAccName">{account.displayName}</div>
            <div className="apaAccGr">{account.group.name}</div>
          </div>
        </div>
        <div className="btn" onClick={() => this.setState({editing : true})}>edit</div>
      </div>
      </>
    );
  }
}

export default Account;
