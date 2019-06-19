import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Func from '../Classes/Func';
import ModalConfirm from '../Classes/ModalConfirm';

class BlogPost extends Component {

  constructor(props){
    super(props);

    this.state = {
        isLiked : false,
        commentsCount : 0
    }
  }

  updateIsLiked = (isLiked) => {
      this.setState({isLiked});
  }

  likePost = (e) => {
      e.preventDefault();
      const {isLiked} = this.state;
      const {socket, user, post, pageId} = this.props;
      if(isLiked || !user.isLogged()) return;
      socket.emit('client > server likePost', user.getBasic(), post._id, pageId, 'blog');
  }

  unlikePost = (e) => {
      e.preventDefault();
      const {isLiked} = this.state;
      const {socket, user, post, pageId} = this.props;
      if(!isLiked || !user.isLogged()) return;
      socket.emit('client > server unlikePost', user.getBasic(), post._id, pageId, 'blog');
  }

  updateCommentsCount = (commentsCount) => {
      this.setState({commentsCount});
  }

  refreshCommentsCount = () => {
      const {socket, post} = this.props;
      if(socket && post) {
          let data = {
              postId : post._id
          };
          socket.emit(`client > server get post commentsCount`, data, this.updateCommentsCount);
      }
  }

  componentDidMount(){
    const {socket, post, pageId, updateLikes, updateViews} = this.props;
    this.refreshCommentsCount();
    if(socket){
        socket.on(`server > client updateLike ${pageId} ${post._id}`, (newLikes) => {
          updateLikes(post._id, newLikes);
        });
        socket.on(`server > client newView blogPost ${post._id}`, (newViews) => updateViews(post._id, newViews));
        socket.on(`server > client refresh commentsCount ${post._id}`, this.refreshCommentsCount);
    }
    }

componentDidUpdate(prevProps){
    if(prevProps == this.props) return;
    const {socket, user, post, pageId, index} = this.props;
    if(socket && user && user.isLogged())
    socket.emit('client > server isLiked', user.getBasic(), post._id, pageId, this.updateIsLiked);
}

setFeatured = (e, featured) => {
    e.preventDefault();
    const {user, socket, post} = this.props;
    let data = {
        userData : user.getBasic(),
        postId : post._id,
        featured
    };
    socket.emit(`client > server blogPosts setFeatured`, data);
}

setVisible = (e, visible) => {
    e.preventDefault();
    const {user, socket, post} = this.props;
    let data = {
        userData : user.getBasic(),
        postId : post._id,
        visible
    };
    socket.emit(`client > server blogPosts setVisible`, data);
}

deletePost = () => {
    const {user, socket, post} = this.props;
    let data = {
        userData : user.getBasic(),
        postId : post._id
    }
    socket.emit(`client > server delete blogPost`, data);
}

  render() {
    const {post, colors, user, parentLoading} = this.props;
    const {commentsCount} = this.state;
    
    let {isLiked} = this.state;
    let postCoverStyle = {};
    let likeIconClassName = "pufficon-like";
    let likeAttr = {};
    let likesContClass = 'bpcsrStat';
    if(!parentLoading){
        if(post.thumbnail) postCoverStyle.style = {backgroundImage : `url(${post.thumbnail})`};
        else if(post.cover) postCoverStyle.style = {backgroundImage : `url(${post.cover})`};
        if(isLiked) likeIconClassName = "pufficon-liked isLiked";
        if(isLiked){
            likeAttr.style = {
                color : colors._active.accent
            }
            likesContClass += ' isLiked';
        }
        if(user && user.isLogged()){
            if(isLiked && user.canThey('unlikePosts')){
                likeAttr.onClick = this.unlikePost;
                likeAttr['data-tooltip'] = 'unlike this';
            }else if(!isLiked && user.canThey('likePosts')){
                likeAttr.onClick = this.likePost;
                likeAttr['data-tooltip'] = 'like this';
            }
        }
    }

    let settingsIcons = [];
    if(user && user.canThey('deleteBlogPosts')){
        settingsIcons.push(
            <i key='delete'
            className="pufficon-delete"
            data-tooltip="delete"
            onClick={(e) => {
                e.preventDefault();
                ModalConfirm(
                    'are you sure you want to delete this post? this action is irreversible!',
                    {
                      confirmAction : this.deletePost
                    }
                );
            }}
            />
        );
    }
    let featuredIcon = (<></>); let visibleIcon = (<></>);
    if(user && user.canThey('editBlogPosts')){
        if(post.featured){
            featuredIcon = (
                <i key='unfeature'
                className="pufficon-featured active"
                data-tooltip="unfeature"
                onClick={(e) => this.setFeatured(e, 0)}
                /> 
            );
        }else{
            featuredIcon = (
                <i key='feature'
                className="pufficon-notfeatured"
                data-tooltip="feature"
                onClick={(e) => this.setFeatured(e, 1)}
                /> 
            );
        }
        if(post.visible){
            visibleIcon = (
                <i key='hide'
                className="pufficon-visible active"
                data-tooltip="hide"
                onClick={(e) => this.setVisible(e, 0)}
                /> 
            );
        }else{
            visibleIcon = (
                <i key='show'
                className="pufficon-notvisible"
                data-tooltip="show"
                onClick={(e) => this.setVisible(e, 1)}
                /> 
            );
        }
        settingsIcons.push(featuredIcon);
        settingsIcons.push(visibleIcon);
        settingsIcons.push(
            <Link to={`/blog/edit/${post._id}`} key='edit'
            className="pufficon-edit"
            data-tooltip="edit" />
        );
    }

    let settingsIconsWrap = (<></>);

    if(settingsIcons.length){
        settingsIconsWrap = (
            <div className="postSettingsIconsWrap">
            {settingsIcons}
            </div>
        );
    }
    
    return (
      <>
      {
          (parentLoading)?(
              <div className="blogPostCont">
                <div className="bpcCover loading" />
                <div className="bpcTitle loading" />
                <div className="bpcStats">
                    <div className="bpcsLeft loading" />
                    <div className="bpcsRight loading" />
                </div>
              </div>
          ):(
            <Link
            className={`blogPostCont${((!post.visible || new Date(post.postDate).getTime() > Date.now())?' notVisible':'')}`} to={"/blog/" + post._id + '/' + Func.speakingUrl(post.title)}>
            {/* <div className="blogPostCont"> */}
            <div className="bpcCover" {...postCoverStyle}>{settingsIconsWrap}</div>
            <div className="bpcTitle">{post.title}</div>
            <div className="bpcStats">
                <div className="bpcsLeft">
                    <div className="bpcDate">{Func.formatDateFeaturedItems(post.postDate)}</div>
                </div>
                <div className="bpcsRight">
                    <div className={likesContClass}>
                        <i className={likeIconClassName} {...likeAttr} />
                        <span>{post.likes.toLocaleString()}</span>
                    </div>
                    <div className="bpcsrStat">
                        <i className="pufficon-view" />
                        <span>{post.views.toLocaleString()}</span>
                    </div>
                    <div className="bpcsrStat">
                        <i className="pufficon-comments" />
                        <span>{commentsCount.toLocaleString()}</span>
                    </div>
                    {
                    (post.author)?(
                        <div 
                            className="bpcsrAuthor"
                            data-tooltip={post.author.displayName}
                            style={{backgroundImage: `url(${post.author.avatar})`}}
                        />
                    ):(
                        <i 
                            className="pufficon-logo"
                            data-tooltip="puffysticks"
                            style={{color: colors._active.accent}}
                        />
                    )
                }
                </div>
            </div>
            {/* </div> */}
            </Link>
          )
      }
      </>
    );
  }
}

export default BlogPost;
