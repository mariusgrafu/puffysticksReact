import React, { Component } from 'react';
import Func from '../../Classes/Func';

import {
    Link,
    Redirect
  } from 'react-router-dom';

import TabPage from './TabPage';

class TabPages extends Component {

  constructor(props){
    super(props);

    this.state = {
      pages : null
    }
  }

  updatePages = (pages) => {
    this.setState({pages});
  }

  refreshPages = () => {
    const {socket} = this.props;

    socket.emit(`client > server get tabPages`, this.updatePages);
  }

  componentDidMount() {
    const {socket} = this.props;
    this.refreshPages();

    socket.on(`server > client refresh tabPages`, this.refreshPages);
  }

  render() {
    const {user, socket} = this.props;
    const {pages} = this.state;

    if(!pages) return(<></>);

    let pagesComps = [];

    for(let i = 0; i < pages.length; ++i) {
      pagesComps.push(
        <TabPage
          key = {i}
          user = {user}
          socket = {socket}
          page = {pages[i]}
        />
      );
    }

    return (
      <>
        <div className="mainWrap adminTabPagesCont">
          {pagesComps}
        </div>
      </>
    );
  }
}

export default TabPages;
