import React, { Component } from 'react';
import CommentPost from './CommentPost';
import Comment from './Comment';

class CommentCont extends Component {

  constructor(props){
    super(props);

    this.state = {
      loading : true,
      commentsCount : 0,
      postVisible : false,
      comments : []
    }
  }

  updateComments = (comments) => {
    if(!comments) return;
    this.setState({comments});
  }

  changePostVisible = (postVisible) => {
    this.setState({postVisible});
  }

  getComments = () => {
    const {comments} = this.state;
    const {socket, postId, pageId} = this.props;
    socket.emit(`client > server get comments`, {postId, pageId, howMany: (comments.length + 5)}, this.updateComments);
  }

  refreshComments = () => {
    const {comments} = this.state;
    const {socket, postId, pageId} = this.props;
    socket.emit(`client > server get comments`, {postId, pageId, howMany: Math.max(comments.length, 5)}, this.updateComments);
  }

  updateCommentsCount = (commentsCount) => {
    this.setState({commentsCount, loading: false});
  }

  incrementCommentsCount = () => {
    let {commentsCount} = this.state;
    commentsCount++;
    this.setState({commentsCount});
  }

  decrementCommentsCount = () => {
    let {commentsCount} = this.state;
    commentsCount--;
    this.setState({commentsCount});
  }

  getCommentsCount = () => {
    const {socket, postId, pageId} = this.props;
    socket.emit(`client > server get commentsCount`, {postId, pageId}, this.updateCommentsCount);
  }

  componentDidMount(){
    const {socket, postId, pageId} = this.props;
    this.getComments();
    this.getCommentsCount();

    socket.on(`server > client new comment ${pageId} ${postId}`, () => {
      this.incrementCommentsCount();
      this.refreshComments();
    });

    socket.on(`server > client delete comment ${pageId} ${postId}`, () => {
      this.decrementCommentsCount();
      this.refreshComments();
    });

    socket.on(`server > client edit comment ${pageId} ${postId}`, () => {
      this.refreshComments();
    });
  }

  render() {
    const {user, socket, colors, postId, pageId, pageKey} = this.props;
    const {loading, postVisible, commentsCount, comments} = this.state;

    return (
      <>
      <div className="commentsCont">
        <div className="commentsCount">
          {commentsCount.toLocaleString() + ((commentsCount == 1)?" comment":" comments")}
        </div>

        {
          (user && user.isLogged() && user.canThey('postComments'))?(
            <>
              {
                (!postVisible)?(
                  <div className="commentPostInactive">
                    <div className="commentPIAvt" style={{backgroundImage: `url(${user.getAvatar()})`}}></div>
                    <div className="btn primary" onClick={() => this.changePostVisible(true)}>comment</div>
                  </div>
                ):(
                  <CommentPost
                    user={user}
                    socket={socket}
                    postId={postId}
                    pageId={pageId}
                    pageKey={pageKey}
                    cancel={() => this.changePostVisible(false)}
                  />
                )
              }
            </>
          ):('')
        }

        {
          (comments && comments.length && user && (!user.isLogged() || user.canThey('seeComments')))?(
            <div className="commentsWrap">
              {
                comments.map((comment) => {
                  return (
                  <Comment
                    key={comment._id}
                    socket={socket}
                    user={user}
                    comment={comment}
                    pageKey={pageKey}
                  />
                  );
                })
              }
              {
                (comments.length < commentsCount)?(
                  <div className="btn commentsWrapLoadMore" onClick={this.getComments}>load more comments</div>
                ):('')
              }
            </div>
          ):('')
        }
        

      </div>
      </>
    );
  }
}

export default CommentCont;
