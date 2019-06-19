import React, { Component } from 'react';

import { Link, Redirect } from 'react-router-dom';
import Func from '../Classes/Func';

class ContactReply extends Component {

  constructor(props){
    super(props);

  }

  render() {
    const {reply} = this.props;

    let replyAvtComp = (<></>);
    let replyAuthorName = ``;

    if(reply.staffMessage) {
        replyAvtComp = (
            <div className="pufficon-logo crwtLogo" />
        );
        replyAuthorName = `puffysticks`;
    }else {
        replyAvtComp = (
            <div className="crwtAvt"
            style={{backgroundImage: `url(${reply.author.avatar})`}}
            />
        );
        replyAuthorName = reply.author.displayName;
    }


    return (
      <div className="contactReplyWrap">
        <div className="crwTop">
            {replyAvtComp}
            <div className="crwtDetails">
                <span className="crwtAuthor">{replyAuthorName}</span>
                <span className="crwtDate">{Func.fullDate(reply.postDate)}</span>
            </div>
        </div>
        <div className="crwContent">
            <div className="contentText" dangerouslySetInnerHTML={{__html : reply.content}} />
        </div>
      </div>
    );
  }
}

export default ContactReply;
