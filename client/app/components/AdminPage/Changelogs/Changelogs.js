import React, { Component } from 'react';
import Func from '../../Classes/Func';

import {
    Link,
    Redirect
  } from 'react-router-dom';

import ChangelogItem from './ChangelogItem';

class Changelogs extends Component {

  constructor(props){
    super(props);

    this.state = {
      changelogs : null
    }
  }

  refreshChangelogs = () => {
    const {socket} = this.props;

    socket.emit(`client > server get changelogs`, this.updateChangelogs);
  }

  updateChangelogs = (changelogs) => {
    this.setState({changelogs});
  }

  componentDidMount() {
      const {socket} = this.props;
      this.refreshChangelogs();

      socket.on(`server > client refresh changelogs`, this.refreshChangelogs);
  }

  render() {
    const {socket, user} = this.props;
    const {changelogs} = this.state;

    if(!changelogs || !changelogs.length) return (<></>);

    let changelogsComps = (
      changelogs.map( (changelog, i) => {
            return (
                <ChangelogItem
                  key = {i}
                  item = {changelog}
                  socket = {socket}
                  user = {user}
                />
            );
        })
    );

    return (
      <>
      <div className="mainWrap adminPageChangelogs">

        {changelogsComps}

      </div>
      </>
    );
  }
}

export default Changelogs;
