import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import Func from '../Classes/Func';
import {Link} from 'react-router-dom';
import Changelog from '../Changelog/Changelog';

class ChangelogPage extends TabPage {

    constructor (props) {
        super(props);

        this.state = {
            changelog : null
        }
    }

    updateChangelog = (changelog) => {
        this.setState({changelog});
    }

    componentDidMount () {
      const {socket} = this.props;
  
      socket.emit(`client > server get main Changelog`, this.updateChangelog);
    }

    render () {
        const {user, socket} = this.props;
        const {changelog} = this.state;

        if(!changelog) return (<></>);

        return (
            <Changelog
            user={user}
            socket={socket}
            key={changelog._id}
            changelogId={changelog._id}
            />
        );
    }

}

export default ChangelogPage;