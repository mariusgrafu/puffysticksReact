import React, { Component } from 'react';
import Func from '../../Classes/Func';
import Toggle from '../../Helpers/Toggle';

import {
    Link,
    Redirect
  } from 'react-router-dom';


class NavLink extends Component {

  constructor(props){
    super(props);

    this.state = {
        link : null,
        editing : false
    }
  }

  refreshLink = () => {
    const {link} = this.props;
    let cLink = $.extend(true,{}, link);
    this.setState({link : cLink});
  }

  componentDidMount() {
      this.refreshLink();
  }

  updateLinkAttr = (k, e) => {
      let {link} = this.state;
      link[k] = e.target.value;
      this.setState({link});
  }

  updateLinkAddress = (k, v) => {
      let {link} = this.state;
      link.address[k] = v;
      this.setState({link});
  }

  cancelEdit = () => {
      const {addNew, closeForm} = this.props;
      if(addNew == true) {
          closeForm();
          return;
      }
      this.refreshLink();
      this.setState({editing : false});
  }

  saveEdit = () => {
      const {link} = this.state;
      const {addNew, closeForm, user, socket} = this.props;
      let data = {
          userData : user.getBasic(),
          link
      };
      socket.emit(`client > server edit navLinks`, data);

      this.setState({editing : false});

      if(addNew == true) {
          closeForm();
      }
  }

  deleteLink = () => {
      const {link} = this.state;
      const {user, socket} = this.props;
      let data = {
          userData : user.getBasic(),
          linkId : link._id
      };

      socket.emit(`client > server delete navLink`, data);
  }

  render() {
    const {link, editing} = this.state;
    const {addNew} = this.props;

    if(!link) return (<></>);

    if(editing || addNew == true) {
        let deleteComp = (<div className="btn" onClick = {this.deleteLink}>delete</div>);
        if(addNew == true) {
            deleteComp = (<></>);
        }
        return (
        <>
        <div className="alLinkWrap editing">
            <div className="alleInputWrap">
                <div className="alleiTitle">key</div>
                <input type="text" value={link.key} onChange = {(e) => this.updateLinkAttr('key', e)} />
            </div>
            <div className="alleInputWrap">
                <div className="alleiTitle">title</div>
                <input type="text" value={link.title} onChange = {(e) => this.updateLinkAttr('title', e)} />
            </div>
            <div className="alleInputWrap">
                <div className="alleiTitle">address</div>
                <input type="text" value={link.address.link} onChange = {(e) => this.updateLinkAddress('link', e.target.value)} />
                <Toggle
                value = {link.address.external}
                title = 'external'
                update = {(val) => this.updateLinkAddress('external', val)}
                />
            </div>

            <div className="alleBtns">
            <div className="btn primary" onClick = {this.saveEdit} >save</div>
            <div className="btn" onClick = {this.cancelEdit}>cancel</div>
            {deleteComp}
            </div>
        </div>
        </>);
    }

    return (
      <>
        <div className="alLinkWrap">
            <div className="allKey">{link.key}</div>
            <div className="allTitle">{link.title}</div>
            <div className="allLink">{link.address.link}</div>
            <div className="btn" onClick={() => this.setState({editing : true})}>edit</div>
        </div>
      </>
    );
  }
}

export default NavLink;
