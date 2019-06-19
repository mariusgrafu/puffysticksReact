import React, { Component } from 'react';
import Func from '../../Classes/Func';

import {
    Link,
    Redirect
  } from 'react-router-dom';

import SocialLink from './SocialLink';

class SocialLinks extends Component {

  constructor(props){
    super(props);

    this.state = {
      links : null,
      newLink : null
    }
  }

  addNewLink = () => {
    let newLink = {
      title : 'new link',
      key : 'newLink',
      address : {
        link : '/',
        external : true
      }
    }

    this.setState({newLink});
  }

  updateLinks = (links) => {
    this.setState({links});
  }

  refreshLinks = () => {
    const {socket} = this.props;

    socket.emit(`client > server get socialLinks`, this.updateLinks);
  }

  componentDidMount() {
    this.refreshLinks();
    const {socket} = this.props;

    socket.on(`server > client refresh socialLinks`, this.refreshLinks);
  }

  render() {
    const {links, newLink} = this.state;
    const {user, socket} = this.props;

    let linksComp = (<div className="alNoLinks">no social links found</div>);

    if(links && links.length) {
      linksComp = (
        links.map( (link, i) => {
          return (
            <SocialLink
            key = {i}
            user = {user}
            socket = {socket}
            link = {link}
            />
          );
        })
      );
    }

    let addNewComp = (<></>);

    let addNewBtn = (
      <div className="alNewBtn">
        <div className="btn primary" onClick = {this.addNewLink}>add new link</div>
      </div>
    );

    if(newLink) {
      addNewComp = (
        <SocialLink
        user = {user}
        socket = {socket}
        link = {newLink}
        addNew = {true}
        closeForm = {() => this.setState({newLink : null})}
        />
      );

      addNewBtn = (<></>);
    }

    return (
      <>
        <div className="mainWrap adminLinksCont">

        <div className="alLinksWrap">
        {linksComp}
        {addNewComp}
        </div>

        
        {addNewBtn}

        </div>
      </>
    );
  }
}

export default SocialLinks;
