import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import Func from '../Classes/Func';
import CommentCont from '../Comment/CommentCont';
import { Link } from 'react-router-dom';
import ModalConfirm from '../Classes/ModalConfirm';

class PortfolioPost extends TabPage {

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
      socket.on(`server > client newView portfolioPost ${post._id}`, (newViews) => this.updateViews(newViews));
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
    if(!pageId) socket.emit(`client > server get pageId with key`, 'portfolio', this.updatePageId);
    this.setState({post, loading: false});
  }
  

  likePost = (e) => {
    e.preventDefault();
    const {isLiked, pageId, post} = this.state;
    const {socket, user} = this.props;
    if(isLiked || !user.isLogged()) return;
    socket.emit('client > server likePost', user.getBasic(), post._id, pageId, 'portfolio');
}

unlikePost = (e) => {
    e.preventDefault();
    const {isLiked, pageId, post} = this.state;
    const {socket, user} = this.props;
    if(!isLiked || !user.isLogged()) return;
    socket.emit('client > server unlikePost', user.getBasic(), post._id, pageId, 'portfolio');
}

refreshPost = () => {
  const {id} = this.props.match.params;
  const {socket, user} = this.props;
  let data = {
    postId : id,
    userData : user.getBasic()
  }
  socket.emit(`client > server get portfolioPost`, data, this.updatePost);
}

  componentDidMount(){
    const {id} = this.props.match.params;
    const {socket} = this.props;
    this.refreshPost();
    socket.emit(`client > server incrementView portfolioPost`, id);

    socket.on(`server > client refresh PortfolioPost ${id}`, () => this.refreshPost());
  }
  
deletePost = () => {
  const {post} = this.state;
  const {user, socket} = this.props;
  let data = {
      userData : user.getBasic(),
      postId : post._id
  }
  socket.emit(`client > server delete portfolioPost`, data);
}

  render() {
    const {colors, user, socket} = this.props;
    const {post, loading, redirect, isLiked, pageId} = this.state;

    let likeComp = [];
    let otherImages = [];
    if(!loading) {
        for(let i = 1; i < post.images.length; ++i){
            otherImages.push(
                <img className="pppwlOtherImage" key={i} src={post.images[i]} data-expandimage />
            );
        }
    }
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

    if(user.canThey('editPortfolioPosts') && post){
      postSettings.push(
        <Link key="edit" to={`/portfolio/edit/${post._id}`}
        className="btn">edit post</Link>
      );
    }

    if(user.canThey('deletePortfolioPosts') && post){
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
        <div className="pppPostSettingsBtns">
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
          <div className="portfolioPostPageCont">
            <div className="mainWrap">
              
            </div>
          </div>
        ):(
        <div className="portfolioPostPageCont">
            <div className="mainWrap">
                <div className="pppwlTop">
                    <div className="pppwltTitle">{post.title}</div>
                    {
                        (post.subTitle)?(
                            <div className="pppwltSubtitle">{post.subTitle}</div>
                        ):('')
                    }
                </div>
                <div className="pppWrap">
                    <div className="pppwLeft">
                        <img className="pppwlMainImage" src={post.images[0]} data-expandimage />
                        {
                           (post.images.length > 1)?(
                               <div className="pppwlOtherImages">{otherImages}</div>
                           ):('')
                        }
                        {
                            (post.description)?(
                                <div className="contentText pppwlDescription" dangerouslySetInnerHTML={{__html: post.description}} />
                            ):('')
                        }
                    </div>
                    <div className="pppwRight">
                    <div className="pppwrStats">
                        <div className="pppwrsLeft">posted</div>
                        <div className="pppwrsRight">{Func.formatDatePostPage(post.postDate)}</div>
                    </div>
                    <div className="pppwrStats">
                        <div className="pppwrsLeft">views</div>
                        <div className="pppwrsRight">{post.views.toLocaleString()}</div>
                    </div>
                    <div className="pppwrStats">
                        <div className="pppwrsLeft">likes</div>
                        <div className="pppwrsRight">{post.likes.toLocaleString()}</div>
                    </div>
                    {
                    likeComp.map((o, i) => {
                    return (<React.Fragment key={i}>{o}</React.Fragment>);
                    })
                    }
                    {postSettingsCont}
                    {
                    (post.tags && post.tags.length)?(
                        <>
                        <div className="pppwrSubcat">tags</div>
                        <div className="pppPostTags">
                        {
                            post.tags.map( (tag, i) => {
                            return (
                                <div className="pppPostTag" key={i}>{tag}</div>
                            );
                            })
                        }
                        </div>
                        </>
                    ):('')
                    }

                    </div>
                </div>

                {
                  (post.showComments)?(
                    <CommentCont
                      user={user}
                      socket={socket}
                      colors={colors}
                      postId={post._id}
                      pageId={pageId}
                      pageKey='portfolio'
                    />
                  ):('')
                }
               
                
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

export default PortfolioPost;
