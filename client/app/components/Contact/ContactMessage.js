import React, { Component } from 'react';

import TabPage from '../TabPage/TabPage';
import { Link, Redirect } from 'react-router-dom';
import Editor from '../Helpers/Editor';
import Func from '../Classes/Func';

import ContactReply from './ContactReply';

class ContactMessage extends TabPage {

  constructor(props){
    super(props);

    this.state = {
        message : null,
        redirect : ``,
        replyMessage : ``,
        autoMessageSuffix : `(this is an automatic message... 🤖 beep bop 🤖)`,
        messageStates : {
            pending : {
                title : 'pending',
                canReply : true
            },
            waiting : {
                title : 'waiting',
                message : `
                we are sorry for making you wait even longer, but 
                we currently have too many active projects. we'll get back to you asap!
                `,
                canReply : true
            },
            active : {
                title : 'active',
                message : `
                we started working on the project. we'll keep you posted!
                `,
                canReply : true
            },
            rejected : {
                title : 'rejected',
                message : `
                we are sorry, but we will have to reject your project 😔
                `,
                canReply : false
            },
            completed : {
                title : 'completed',
                message : `
                the project is now complete! we hope to hear from you again 😊
                `,
                canReply : false
            }
        }
    };
  }

  changeMessageStateClick = (newState, e) => {
    const {messageStates, autoMessageSuffix, message} = this.state;
    if(message.state == newState) return;
    if(e.ctrlKey && messageStates[newState].message) {
        this.sendAutoReply(messageStates[newState].message + ' ' + autoMessageSuffix);
    }
    this.changeMessageState(newState);
  }

  changeMessageState = (newState) => {
      const {user, socket, messageId} = this.props;

      let data = {
          userData : user.getBasic(),
          messageId : messageId,
          newState
      }
      socket.emit(`client > server change state ContactMessage`, data);
  }

  sendAutoReply = (msg) => {
    const {user, socket, messageId} = this.props;
    if(!user.isStaff()) return;
    let data = {
        userId : user._id,
        messageId,
        message : msg,
        staffMessage : user.isStaff()
    }

    socket.emit(`client > server add new ContactRepy`, data);
  }

  sendReply = () => {
      let {replyMessage} = this.state;
      const {user, socket, messageId} = this.props;
    let data = {
        userId : user._id,
        messageId,
        message : replyMessage,
        staffMessage : user.isStaff()
    }

    socket.emit(`client > server add new ContactRepy`, data);
    this.setState({replyMessage : ``});

  }

  updateReplyMessage = (replyMessage) => {
      this.setState({replyMessage});
  }

  updateMessage = (message) => {
      const {user} = this.props;
      if(!message || message.author._id != user._id && !user.isStaff()){
          this.setState({redirect : true});
          return;
      }
      this.setState({message});
  }

  refreshMessage = () => {
    const {socket, messageId} = this.props;
    let data = {
        messageId
    }
    socket.emit(`client > server get ContactMessage`, data, this.updateMessage);
  }

  componentDidMount () {
      const {socket, messageId} = this.props;

      this.refreshMessage();

      socket.on(`server > client refresh ContactMessage ${messageId}`, this.refreshMessage);
  }

  render() {
      const {user, socket} = this.props;
      const {message, redirect, replyMessage, messageStates} = this.state;

      if(redirect){
          return (
              <Redirect to="/notfound" />
          );
      }

      if(!message) return (<></>);

      let typeString = message.type || 'Other';
      let budgetComp = (
          <span className="cmtBudgetUnspecified">unspecified</span>
      );

      if(message.budget) {
          budgetComp = (
              <>
              <span className="cmtBudgetSum">{parseFloat(message.budget).toLocaleString()}</span>
              <span className="cmtBudgetCurrency">€</span>
              </>
          );
      }

      let repliesString = `replies`;
      if(message.replies.length == 1) repliesString = 'reply';

      let repliesComps = (<></>);

      if(message.replies.length) {
          repliesComps = [];
          message.replies.map( (reply, i) => {
            repliesComps.push(
                <ContactReply
                key = {`${i}-${reply._id}`}
                user = {user}
                socket = {socket}
                reply = {reply}
                />
            );
          });
      }

      let stateComp = (<span className="cmtState">{messageStates[message.state].title}</span>);

      if(user.isStaff()) {
          
        let stateArrComp = [];
        for(let k in messageStates) {
            let isActive = ``;
            if(k == message.state) isActive = ` selected`;
            stateArrComp.push(
                <span key={k}
                onClick = {(e) => this.changeMessageStateClick(k, e)}
                className={`cmtModState${isActive}`}
                >{messageStates[k].title}</span>
            );
        }

        stateComp = (
            <span className="cmtModStates noSelect">{stateArrComp}</span>
        );
      }

      let replyEditorComp = (<></>);

      if(messageStates[message.state].canReply === true && user.canThey(`sendContactMessage`)) {
          replyEditorComp = (
            <div className="cmrLeaveReplyWrap">
            <div className="cmrlrTitle">leave a reply</div>
            <Editor
            user = {user}
            socket = {socket}
            text = {replyMessage}
            change = {this.updateReplyMessage}
            />
            <div className="cmrLeaveReplyBtns">
                <div className="btn primary" onClick={this.sendReply}>send reply</div>
            </div>
            </div>
          );
      }else{
          if(user.isStaff()) {
            replyEditorComp = (
                <div className="cmrLeaveReplyWrap">
                <div className="cmrlrTitle">leave a reply (only staff can reply)</div>
                <Editor
                user = {user}
                socket = {socket}
                text = {replyMessage}
                change = {this.updateReplyMessage}
                />
                <div className="cmrLeaveReplyBtns">
                    <div className="btn primary" onClick={this.sendReply}>send reply</div>
                </div>
                </div>
              );
          } else {
            replyEditorComp = (
                <div className="cmrLeaveReplyWrap">
                <div className="cmrlrTitle" style={{marginBottom: 0}}>you can no longer reply to this message</div>
                </div>
              );
          }
      }

    return (
      <>
        <div className="contactMessageWrap">
            <div className="mainWrap">
                <div className="contactMessageTop">
                    <div className="cmtTitleState">
                        <span className="cmtTitle">{message.title}</span>
                        {stateComp}
                    </div>
                    <div className="cmtTypeBudget">
                        <div className="cmtType" dangerouslySetInnerHTML={{__html : typeString}} />
                        <div className="cmtBudget">
                            <span className="cmtBudgetTitle">budget: </span>
                            {budgetComp}
                        </div>
                    </div>
                    <div className="cmtAuthorCont">
                        <div className="cmtAuthorAvt" style={{backgroundImage: `url(${message.author.avatar})`}} />
                        <div className="cmtAuthorNameCont">
                            <div className="cmtAuthorName">{message.author.displayName}</div>
                            <div className="cmtAuthorTitle">{Func.fullDate(message.postDate)}</div>
                        </div>
                    </div>
                </div>

                <div className="contactMessageContentWrap">
                    <div className="contentText" dangerouslySetInnerHTML={{__html : message.content}} />
                </div>

                <div className="contactMessageRepliesWrap">
                    <div className="cmrRepliesCountWrap">
                        <span className="cmrrcNum">{message.replies.length.toLocaleString()}</span>
                        <span className="cmrrcRep">&nbsp;{repliesString}</span>
                    </div>

                    <div className="cmrContactRepliesWrap">
                        {repliesComps}
                    </div>

                    {replyEditorComp}
                </div>
            </div>
        </div>
      </>
    );
  }
}

export default ContactMessage;
