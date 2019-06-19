import React, { Component } from 'react';
import Emojis from '../Helpers/Emojis';

class CommentEdit extends Component {

  constructor(props){
    super(props);

    this.state = {
        message : props.comment.content,
        showHelper : null
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
    const {socket, user, comment, cancel} = this.props;
    socket.emit(`client > server edit comment`, {message, userData : user.getBasic(), comment});
    cancel();
  }

  toggleHelper = (helper) => {
    let {showHelper} = this.state;
    if(helper == showHelper) showHelper = null;
    else showHelper = helper;
    this.setState({showHelper});
  }

  render() {
    const {cancel} = this.props;
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
                <div className="btn primary" onClick={this.submitMessage}>edit</div>
                <div className="btn" onClick={cancel}>cancel</div>
            </div>
        </form>
      </>
    );
  }
}

export default CommentEdit;
