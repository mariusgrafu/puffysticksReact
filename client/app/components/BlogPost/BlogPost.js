import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import Func from '../Classes/Func';
import ReadNext from './ReadNext';
import CommentCont from '../Comment/CommentCont';
import { Link } from 'react-router-dom';
import ModalConfirm from '../Classes/ModalConfirm';

class BlogPost extends TabPage {

  constructor(props){
    super(props);

    this.state = {
      pageId : null,
      isLiked : false,
      redirect : false,
      loading : true,
      post : {}
    };

  }

  updateIsLiked = (isLiked) => {
    this.setState({isLiked});
  }

  updateViews = (newViews) => {
    let {post} = this.state;
    post.views = newViews;
    this.setState({newViews});
  }

  updatePageId = (pageId) => {
    const {user, socket} = this.props;
    const {post} = this.state;
    if(user && user.isLogged()){
      socket.emit(`client > server isLiked`, user.getBasic(), post._id, pageId, this.updateIsLiked);
    }
    if(pageId && post){
      socket.on(`server > client updateLike ${pageId} ${post._id}`, (newLikes) => this.updateLikes(newLikes));
      socket.on(`server > client newView blogPost ${post._id}`, (newViews) => this.updateViews(newViews));
    }
    this.setState({pageId});
  }

  updateLikes = (newLikes) => {
    let {post} = this.state;
    post.likes = newLikes;
    this.setState({post});

    const {user, socket} = this.props;
    const {pageId} = this.state;
    if(user && user.isLogged()){
      socket.emit(`client > server isLiked`, user.getBasic(), post._id, pageId, this.updateIsLiked);
    }
  }

  updatePost = (post) => {
    if(!post){
      this.setState({redirect : true});
      return;
    }
    post.views++;
    const {socket} = this.props;
    const {pageId} = this.state;
    if(!pageId) socket.emit(`client > server get pageId with key`, 'blog', this.updatePageId);
    this.setState({post, loading: false});
  }
  

  likePost = (e) => {
    e.preventDefault();
    const {isLiked, pageId, post} = this.state;
    const {socket, user} = this.props;
    if(isLiked || !user.isLogged()) return;
    socket.emit('client > server likePost', user.getBasic(), post._id, pageId, 'blog');
}

unlikePost = (e) => {
    e.preventDefault();
    const {isLiked, pageId, post} = this.state;
    const {socket, user} = this.props;
    if(!isLiked || !user.isLogged()) return;
    socket.emit('client > server unlikePost', user.getBasic(), post._id, pageId, 'blog');
}

refreshPost = () => {
  const {id} = this.props.match.params;
  const {socket, user} = this.props;
  let data = {
    postId : id,
    userData : user.getBasic()
  }
  socket.emit(`client > server get blogPost`, data, this.updatePost);
}

  componentDidMount(){
    const {id} = this.props.match.params;
    const {socket} = this.props;
    this.refreshPost();
    socket.emit(`client > server incrementView blogPost`, id);

    socket.on(`server > client refresh BlogPost ${id}`, () => this.refreshPost());
  }
  
deletePost = () => {
  const {post} = this.state;
  const {user, socket} = this.props;
  let data = {
      userData : user.getBasic(),
      postId : post._id
  }
  socket.emit(`client > server delete blogPost`, data);
}

  render() {
    const {colors, user, socket} = this.props;
    const {post, loading, redirect, isLiked, pageId} = this.state;

    let likeComp = [];
    if(!loading && user && user.isLogged()){
      if(isLiked){
          likeComp.push(
            <div className="likePostLikedWrap">
              <div className="lpLikedMsg">
                <i className="pufficon-liked" style={{color: colors._active.accent}} />
                <span>i like this</span>
              </div>
              {
                (user.canThey('unlikePosts'))?(
                  <div className="btn unlike" onClick={this.unlikePost}>unlike</div>
                ):('')
              }
            </div>
          );
      }else if(user.canThey('likePosts')){
        likeComp.push(
          <div className="likePostLikedWrap">
            <div className="btn primary" onClick={this.likePost}><i className="pufficon-like" />like</div>
          </div>
        );
      }
    }

    let postSettingsCont = (<></>);
    let postSettings = [];

    if(user.canThey('editBlogPosts') && post){
      postSettings.push(
        <Link key="edit" to={`/blog/edit/${post._id}`}
        className="btn">edit post</Link>
      );
    }

    if(user.canThey('deleteBlogPosts') && post){
      postSettings.push(
        <div key="delete"
        className="btn"
        onClick={(e) => {
          e.preventDefault();
          ModalConfirm(
              'are you sure you want to delete this post? this action is irreversible!',
              {
                confirmAction : this.deletePost
              }
          );
      }}
        >delete post</div>
      );
    }

    if(postSettings.length){
      postSettingsCont = (
        <div className="bppPostSettingsBtns">
        {postSettings}
        </div>
      );
    }

    return (
      <>
      {
      (redirect)?(
        <Redirect to="/notfound" />
      ):(
        <>
        {(loading || !pageId)?(
          <div className="blogPostPageCont">
            <div className="mainWrap">
              <div className="bppTop">
                <div className="bpptTitle loading" />
                <div className="bpptSubTitle loading" />
              </div>
              <div className="bppCover loading" />
              <div className="bppContentCont">
                <div className="bppCCAuthorWrap">
                  <div className="bppccaAuthorInfo">
                    <div className="bppccaAvt loading" />
                    <div className="bppccaName loading" />
                  </div>
                </div>
                <div className="bppCCPostWrap" style={{padding: `20px`}}>
                <div className="bppCCPostStats loading" />
                <div className="bppCCPostCont loading" />
                </div>
              </div>
            </div>
          </div>
        ):(
        <div className="blogPostPageCont">
          <div className="mainWrap">
            <div className="bppTop">
              <div className="bpptTitle">{post.title}</div>
              {
                (post.subTitle)?(
                  <div className="bpptSubTitle">{post.subTitle}</div>
                ):('')
              }
            </div>
            <div className="bppCover" style={{backgroundImage: `url(${post.cover})`}} />
            <div className="bppContentCont">

              <div className="bppCCAuthorWrap">
                <div className="bppccaAuthorInfo">
                {
                  (post.author)?(
                    <>
                    <div className="bppccaAvt" style={{backgroundImage : `url(${post.author.avatar})`}} />
                    <div className="bppccaName"><span>by</span> {post.author.displayName}</div>
                    </>
                  ):(
                    <>
                    <i className="pufficon-logo" style={{color: colors._active.accent}} />
                    <div className="bppccaName"><span>by</span> puffysticks</div>
                    </>
                  )
                }
                </div>
                
                <div className="bppccLikeWrap">
                {
                  likeComp.map((o, i) => {
                  return (<React.Fragment key={i}>{o}</React.Fragment>);
                  })
                }
                <div className="bppccLikeCount">{post.likes.toLocaleString() + ((post.likes == 1)?" like":" likes")}</div>
                </div>

                {postSettingsCont}
                  
              </div>
              <div className="bppCCPostWrap">
                
              <div className="bppCCPostRN">
              <div className="bppCCPost">
              <div className="bppCCPostStats">
                  <div className="bppCCPostStat">{Func.formatDatePostPage(post.postDate)}</div>
                  <div className="bppCCPostStat">{post.views.toLocaleString() + ((post.views == 1)?" view":" views")}</div>
                </div>

                <div className="contentText bppCCPostCont" dangerouslySetInnerHTML={{__html: post.content}} />
                </div>
              <ReadNext 
                socket={socket}
                postId={post._id}
                tags={post.tags}
                catType={post.catType}
              />
              </div>

                {
                  (post.tags && post.tags.length)?(
                    <div className="bppCCPostTags">
                      {
                        post.tags.map( (tag, i) => {
                          return (
                            <div className="bppCCPostTag" key={i}>{tag}</div>
                          );
                        })
                      }
                    </div>
                  ):('')
                }

                {
                  (post.showComments)?(
                    <CommentCont
                      user={user}
                      socket={socket}
                      colors={colors}
                      postId={post._id}
                      pageId={pageId}
                      pageKey='blog'
                    />
                  ):('')
                }
               
                
              </div>

            </div>
          </div>
        </div>
        )}
        </>
      )
      }
      </>
    );
  }
}

export default BlogPost;
