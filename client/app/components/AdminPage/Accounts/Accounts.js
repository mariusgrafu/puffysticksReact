import React, { Component } from 'react';
import Func from '../../Classes/Func';

import {
    Link,
    Redirect
  } from 'react-router-dom';

import Account from './Account';

class Accounts extends Component {

  constructor(props){
    super(props);

    this.state = {
      accounts : null
    }
  }

  refreshAccounts = () => {
    const {socket} = this.props;

    socket.emit(`client > server get users`, this.updateAccounts);
  }

  updateAccounts = (accounts) => {
    this.setState({accounts});
  }

  componentDidMount() {
      const {socket} = this.props;
      this.refreshAccounts();

      socket.on(`server > client refresh users`, this.refreshAccounts);
  }

  render() {
    const {socket, user} = this.props;
    const {accounts} = this.state;

    if(!accounts || !accounts.length) return (<></>);

    let accountsComps = (
        accounts.map( (account, i) => {
            return (
                <Account
                  key = {i + Math.random()}
                  account = {account}
                  socket = {socket}
                  user = {user}
                />
            );
        })
    );

    return (
      <>
      <div className="mainWrap adminPageAccounts">

        {accountsComps}

      </div>
      </>
    );
  }
}

export default Accounts;
