import React, { Component } from 'react';
import Emojis from '../Helpers/Emojis';

class CommentPost extends Component {

  constructor(props){
    super(props);

    this.state = {
      showHelper : null,
      message : `${(props.replyTo != undefined)?(`${props.replyTo} `):('')}`
    }
  }

  updateMessage = (e) => {
    this.setState({message : e.target.value});
  }

  insertEmoji = (em) => {
    let {message} = this.state;
    if(message == undefined) message = '';
    message += em;
    this.setState({message});
  }

  submitMessage = () => {
    const {message} = this.state;
    const {socket, user, pageId, postId, parentId, cancel, pageKey} = this.props;
    socket.emit(`client > server post comment`, {message, userData : user.getBasic(), postId, pageId, pageKey, parentId});
    cancel();
  }

  toggleHelper = (helper) => {
    let {showHelper} = this.state;
    if(helper == showHelper) showHelper = null;
    else showHelper = helper;
    this.setState({showHelper});
  }

  render() {
      const {user, cancel} = this.props;
      const {message, showHelper} = this.state;

    let helperComp = (<></>);
    if(showHelper == 'emoji'){
      helperComp = (
        <Emojis
        closeWrap={() => this.setState({showHelper : null})}
        submit={this.insertEmoji}
        />)
        ;
    }

    return (
      <>
        <div className="commentPost">
        <div className="commentPostAvt" style={{backgroundImage: `url(${user.getAvatar()})`}}></div>
        <form className="commentPostForm" onSubmit={this.submitMessage}>
            <div className="commentHelpers">
            <div className="commentHelpersTop">
              <i className={`pufficon-emoji${((showHelper == 'emoji')?' selected':'')}`}
              data-tooltip="insert emoji"
              onClick={() => this.toggleHelper('emoji')}
              />
            </div>
            <div className="commentHelperWrap">
            {helperComp}
            </div>
            </div>
            <input type="text" placeholder="say something" value={message} onChange={this.updateMessage} />
            <div className="commentPostBtns">
                <div className="btn primary" onClick={this.submitMessage}>comment</div>
                <div className="btn" onClick={cancel}>cancel</div>
            </div>
        </form>
        </div>
      </>
    );
  }
}

export default CommentPost;
