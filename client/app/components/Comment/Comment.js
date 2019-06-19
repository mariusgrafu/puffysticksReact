import React, { Component } from 'react';
import Func from '../Classes/Func';
import ModalConfirm from '../Classes/ModalConfirm';
import contextMenu from '../Classes/ContextMenu';
import CommentEdit from './CommentEdit';
import CommentPost from './CommentPost';

class Comment extends Component {

  constructor(props){
    super(props);

    this.state = {
      editing : false,
      noMore : false,
      repliesCount : 0,
      postVisible : false,
      replies : []
    }
  }

  updateReplies = (replies) => {
    this.setState({replies});
  }

  getReplies = () => {
    const {replies} = this.state;
    const {socket, comment} = this.props;
    const {postId, pageId} = comment;
    socket.emit(`client > server get comments`, {parentId : comment._id, postId, pageId, howMany: (replies.length + 5)}, this.updateReplies);
  }

  refreshReplies = () => {
    const {replies} = this.state;
    const {socket, comment} = this.props;
    const {postId, pageId} = comment;
    socket.emit(`client > server get comments`, {parentId : comment._id, postId, pageId, howMany: Math.max(replies.length, 5)}, this.updateReplies);
  }

  deleteComment = () => {
    const {user, socket, comment} = this.props;
    socket.emit(`client > server delete comment`, user.getBasic(), comment);
  }

  editComment = () => {
    this.setState({editing : true});
  }

  updateRepliesCount = (repliesCount) => {
    this.setState({repliesCount});
  }

  incrementRepliesCount = () => {
    let {repliesCount} = this.state;
    repliesCount++;
    this.setState({repliesCount});
  }

  decrementRepliesCount = () => {
    let {repliesCount} = this.state;
    repliesCount--;
    this.setState({repliesCount});
  }

  getRepliesCount = () => {
    const {socket, comment} = this.props;
    const {postId, pageId} = comment;
    socket.emit(`client > server get commentsCount`, {parentId : comment._id, postId, pageId}, this.updateRepliesCount);
  }

  componentDidMount(){
    const {socket, comment} = this.props;
    const {pageId, postId} = comment;
    if(comment.parentId != undefined) return;

    this.getReplies();
    this.getRepliesCount();

    socket.on(`server > client new comment ${comment._id} ${pageId} ${postId}`, () => {
      this.refreshReplies();
      this.incrementRepliesCount();
    });

    socket.on(`server > client delete comment ${comment._id} ${pageId} ${postId}`, () => {
      this.refreshReplies();
      this.decrementRepliesCount();
    });

    socket.on(`server > client edit comment ${comment._id} ${pageId} ${postId}`, () => {
      this.refreshReplies();
    });
  }

  render() {
    const {user, comment, socket, pageKey} = this.props;
    let {editing, replies, repliesCount, postVisible} = this.state;
    let contextMenuOptions = [];
    let contextMenuIcon = [];
    if(user.isLogged() && !editing){
      if(user.canThey('editComments') || (user.canThey('editOwnComments') && user.getBasic().userId == comment.author._id)){
        contextMenuOptions.push([
          'edit comment',
          this.editComment
        ]);
      }
      if(user.canThey('deleteComments') || (user.canThey('deleteOwnComments') && user.getBasic().userId == comment.author._id)){
        contextMenuOptions.push([
          'delete comment',
          () => ModalConfirm(
            'are you sure you want to delete this comment? this action is irreversible!',
            {
              confirmAction : this.deleteComment
            }
          )
        ]);
      }
      
      if(contextMenuOptions.length){
        contextMenuIcon.push(
          <i className="cicwTContextMenu pufficon-moredots" key={Math.random()} onClick={
            (e) => contextMenu(e, contextMenuOptions)
          }/>
        );
      }
    }
    return (
      <>
        <div className="commentItem">
            <div className="commentItemAvatar" style={{backgroundImage: `url(${comment.author.avatar})`}} />
            <div className="commentItemContentWrap">
                <div className="cicwTop">
                    <div className="cicwTAuthorName">{comment.author.displayName}</div>
                    <div className="cicwTPostDate">{Func.formatDateFeaturedItems(comment.postDate)}</div>
                    {
                      (comment.edited.isEdited)?(
                        <div className="cicwTEdited" data-tooltip={Func.formatDateFeaturedItems(comment.edited.editTime)}>(edited)</div>
                      ):('')
                    }
                    {
                      (user && user.isLogged() && user.canThey('postComments') && !postVisible)?(
                        <div className="cicwTReply" onClick={() => this.setState({postVisible: true})}>reply</div>
                      ):('')
                    }
                    {contextMenuIcon}
                </div>
                <div className="cicwContent">
                {
                  (editing)?(
                    <CommentEdit comment={comment} user={user} socket={socket} cancel={() => this.setState({editing: false})} />
                  ):(comment.content)
                }
                </div>
                {
                  (user && user.isLogged() && user.canThey('postComments') && postVisible)?(
                    <CommentPost
                    user={user}
                    socket={socket}
                    replyTo={`@${comment.author.displayName}`}
                    parentId={((comment.parentId == undefined)?(comment._id):(comment.parentId))}
                    postId={comment.postId}
                    pageId={comment.pageId}
                    pageKey={pageKey}
                    cancel={() => this.setState({postVisible: false})}
                    />
                  ):('')
                }
                {
                  (comment.parentId == undefined && replies.length)?(
                    <div className="cicwRepliesCont">
                    {
                      replies.map( (reply) => {
                        return(<Comment
                        key={reply._id}
                        socket={socket}
                        user={user}
                        pageKey={pageKey}
                        comment={reply}
                        />);
                      })
                    }
                    {
                      (replies.length < repliesCount)?(
                        <div className="btn commentsWrapLoadMore" onClick={this.getReplies}>load more replies</div>
                      ):('')
                    }
                    </div>
                  ):('')
                }
            </div>
        </div>
      </>
    );
  }
}

export default Comment;
