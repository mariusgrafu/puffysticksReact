import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Func from '../Classes/Func';
import ModalConfirm from '../Classes/ModalConfirm';

class PortfolioPost extends Component {

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
      socket.emit('client > server likePost', user.getBasic(), post._id, pageId, 'portfolio');
  }

  unlikePost = (e) => {
      e.preventDefault();
      const {isLiked} = this.state;
      const {socket, user, post, pageId} = this.props;
      if(!isLiked || !user.isLogged()) return;
      socket.emit('client > server unlikePost', user.getBasic(), post._id, pageId, 'portfolio');
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
        socket.on(`server > client newView portfolioPost ${post._id}`, (newViews) => updateViews(post._id, newViews));
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
    socket.emit(`client > server portfolioPosts setFeatured`, data);
}

setVisible = (e, visible) => {
    e.preventDefault();
    const {user, socket, post} = this.props;
    let data = {
        userData : user.getBasic(),
        postId : post._id,
        visible
    };
    socket.emit(`client > server portfolioPosts setVisible`, data);
}

deletePost = () => {
    const {user, socket, post} = this.props;
    let data = {
        userData : user.getBasic(),
        postId : post._id
    }
    socket.emit(`client > server delete portfolioPost`, data);
}

  render() {
    const {post, colors, user, parentLoading} = this.props;
    const {commentsCount} = this.state;

    let {isLiked} = this.state;
    let postCoverStyle = {};
    let likeIconClassName = "pufficon-like";
    let likeAttr = {};
    let likesContClass = 'ppcsStat';
    if(!parentLoading){
        if(post.thumbnail) postCoverStyle.style = {backgroundImage : `url(${post.thumbnail})`};
        else postCoverStyle.style = {backgroundImage : `url(${post.images[0]})`};
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
    if(user && user.canThey('deletePortfolioPosts')){
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
    if(user && user.canThey('editPortfolioPosts')){
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
            <Link to={`/portfolio/edit/${post._id}`} key='edit'
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
              <div className="portfolioPostCont">
                <div className="ppcCover loading" />
                <div className="ppcTitle loading" />
                <div className="ppcStats loading" />
              </div>
          ):(
            <Link
            className={`portfolioPostCont${((!post.visible || new Date(post.postDate).getTime() > Date.now())?' notVisible':'')}`}
            to={"/portfolio/" + post._id + '/' + Func.speakingUrl(post.title)}
            >
            <div className="ppcCover" {...postCoverStyle}>{settingsIconsWrap}</div>
            <div className="ppcTitle">{post.title}</div>
            <div className="ppcStats">
                    <div className={likesContClass}>
                        <i className={likeIconClassName} {...likeAttr} />
                        <span>{post.likes.toLocaleString()}</span>
                    </div>
                    <div className="ppcsStat">
                        <i className="pufficon-view" />
                        <span>{post.views.toLocaleString()}</span>
                    </div>
                    <div className="ppcsStat">
                        <i className="pufficon-comments" />
                        <span>{commentsCount.toLocaleString()}</span>
                    </div>
            </div>
            </Link>
          )
      }
      </>
    );
  }
}

export default PortfolioPost;
