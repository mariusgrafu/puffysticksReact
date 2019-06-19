import React, { Component } from 'react';
import Func from '../../Classes/Func';

import Changelog from '../../Changelog/Changelog';

import {
    Link,
    Redirect
  } from 'react-router-dom';


class ChangelogItem extends Component {

  constructor(props){
    super(props);

    this.state = {
      item : props.item,
      editing : false
    }
  }

  refreshItem= () => {
    const {item} = this.props;
    let cChangelog = $.extend(true,{}, item);
    this.setState({item : cChangelog});
  }

  cancelEdit = () => {
    this.refreshItem();
    this.setState({editing : false});
  }

  render() {
    const {item, editing} = this.state;
    const {user, socket} = this.props;

    if(!item) return (<></>);

    if(editing) {
      return (
      <div className="apcChangelogWrap editing">
        <Changelog
            user={user}
            socket={socket}
            key={item._id}
            changelogId={item._id}
            goBack={this.cancelEdit}
        />
      </div>
      );
    }

    let goodieComp = (<></>);

    if(item.goodieId) {
        goodieComp = (
            <div className="apcChGoodieCont">
                belongs to <Link to={`/goodies/${item.goodieId._id}/${Func.speakingUrl(item.goodieId.title)}`} target="_blank">{item.goodieId.title}</Link>
            </div>
        );
    }

    return (
      <>
      <div className="apcChangelogWrap">
        <div className="apcChTitleVersions">
          <div className="apcChTitle">{item.title}</div>
          <div className="apcChVersions">({item.versions.length} version{(item.versions.length != 1)?(`s`):(``)})</div>
        </div>
        {goodieComp}
        <div className="btn" onClick={() => this.setState({editing : true})}>edit</div>
      </div>
      </>
    );
  }
}

export default ChangelogItem;
