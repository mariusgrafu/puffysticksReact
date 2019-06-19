import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import Func from '../Classes/Func';
import CommentCont from '../Comment/CommentCont';
import {Link} from 'react-router-dom';
import AlsoOnPlatform from './AlsoOnPlatform';
import Changelog from '../Changelog/Changelog';
import ModalConfirm from '../Classes/ModalConfirm';

class GoodiesPost extends TabPage {

  constructor(props){
    super(props);

    this.state = {
      pageId : null,
      isLiked : false,
      redirect : false,
      loading : true,
      showChangelog : false,
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
      socket.on(`server > client newView goodiesPost ${post._id}`, (newViews) => this.updateViews(newViews));
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
    if(!pageId) socket.emit(`client > server get pageId with key`, 'goodies', this.updatePageId);
    this.setState({post, loading: false});
  }
  

  likePost = (e) => {
    e.preventDefault();
    const {isLiked, pageId, post} = this.state;
    const {socket, user} = this.props;
    if(isLiked || !user.isLogged()) return;
    socket.emit('client > server likePost', user.getBasic(), post._id, pageId, 'goodies');
}

unlikePost = (e) => {
    e.preventDefault();
    const {isLiked, pageId, post} = this.state;
    const {socket, user} = this.props;
    if(!isLiked || !user.isLogged()) return;
    socket.emit('client > server unlikePost', user.getBasic(), post._id, pageId, 'goodies');
}

refreshPost = () => {
  const {id} = this.props.match.params;
  const {socket, user} = this.props;
  let data = {
    postId : id,
    userData : user.getBasic()
  }
  socket.emit(`client > server get goodiesPost`, data, this.updatePost);
}

  componentDidMount(){
    const {id} = this.props.match.params;
    const {socket} = this.props;
    this.refreshPost();
    socket.emit(`client > server incrementView goodiesPost`, id);
    
    socket.on(`server > client refresh GoodiesPost ${id}`, () => this.refreshPost());
  }
    
deletePost = () => {
  const {post} = this.state;
  const {user, socket} = this.props;
  let data = {
      userData : user.getBasic(),
      postId : post._id
  }
  socket.emit(`client > server delete goodiesPost`, data);
}

createChangelog = () => {
  const {socket, user} = this.props;
  const {post} = this.state;
  let data = {
    userData : user.getBasic(),
    title : post.title,
    goodieId : post._id
  };

  socket.emit(`client > server create Changelog`, data);
}

  render() {
    const {colors, user, socket} = this.props;
    const {post, loading, redirect, isLiked, pageId, showChangelog} = this.state;
    
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

    if(user.canThey('editGoodiesPosts') && post){
      postSettings.push(
        <Link key="edit" to={`/goodies/edit/${post._id}`}
        className="btn">edit post</Link>
      );
    }

    if(user.canThey('deleteGoodiesPosts') && post){
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
        <div className="gppPostSettingsBtns">
        {postSettings}
        </div>
      );
    }

    let changelogBtn = (<></>);

    if(post.changelog && post.showChangelog == true) {
      changelogBtn = (
        <div className="btn"
        onClick={() => {this.setState({showChangelog : true})}}
        >changelog</div>
      );
    }

    if(!post.changelog && user.canThey('editGoodiesPosts') && user.canThey('editChangelogs')){
      changelogBtn = (
        <div className="btn"
        onClick={this.createChangelog}
        >create changelog</div>
      );
    }

    if(post.changelog && post.showChangelog != true && user.canThey('editGoodiesPosts') && user.canThey('editChangelogs')){
      changelogBtn = (
        <>
        <div className="btn"
        onClick={() => {this.setState({showChangelog : true})}}
        >changelog</div>
        <div className="gppChangelogBtnDesc">this changelog is <b>not</b> public</div>
        </>
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
          <div className="goodiesPostPageCont">
            <div className="mainWrap">
              
            </div>
          </div>
        ):(
          <>
          {
            (showChangelog && post.changelog)?(
              <Changelog
                user={user}
                socket={socket}
                key={post.changelog}
                changelogId={post.changelog}
                goBack={() => {this.setState({showChangelog : false})}}
              />
            ):(
              <>
              <div className="goodiesPostPageCont">
            <div className="mainWrap">
                <div className="gppcTop">
                    <div className="gppctTitle">{post.title}</div>
                    {
                        (post.subTitle)?(
                            <div className="gppctSubtitle">{post.subTitle}</div>
                        ):('')
                    }
                </div>
                <div className="gppcWrap">
                <div className="gppcwLeft">
                    <img className="gppcwlCover" src={post.cover}/>
                    {
                    (post.description)?(
                        <div className="contentText gppcwlDesc" dangerouslySetInnerHTML={{__html: post.description}}/>
                    ):('')
                    }
                </div>

                <div className="gppcwRight">
                    <div className="gppcwrBtns">
                    <a href={post.downloadUrl} className="btn primary" target="_blank">download</a>
                    {changelogBtn}
                    {
                      (post.allowBugReport)?(
                        <Link to={`/support/new/${post._id}`} className="btn">report a bug</Link>
                      ):('')
                    }
                    </div>
                    <div className="gppcwrStatsWrap">
                    {
                      (post.releaseDate.visible)?(
                        <div className="gppcwrStats">
                          <div className="gppcwrsLeft">release date</div>
                          <div className="gppcwrsRight">{Func.formatDatePostPage(post.releaseDate.value)}</div>
                        </div>
                      ):('')
                    }
                    {
                      (post.updateDate.visible)?(
                        <div className="gppcwrStats">
                          <div className="gppcwrsLeft">updated</div>
                          <div className="gppcwrsRight">{Func.formatDatePostPage(post.updateDate.value)}</div>
                        </div>
                      ):('')
                    }
                    {
                      (post.version)?(
                        <div className="gppcwrStats">
                          <div className="gppcwrsLeft">version</div>
                          <div className="gppcwrsRight">{post.version}</div>
                        </div>
                      ):('')
                    }
                    {
                      (post.platform.length)?(
                        <div className="gppcwrStats">
                          <div className="gppcwrsLeft">platform</div>
                          <div className="gppcwrsRight">{post.platform.join(', ')}</div>
                        </div>
                      ):('')
                    }
                    <div className="gppcwrStats">
                          <div className="gppcwrsLeft">views</div>
                          <div className="gppcwrsRight">{post.views.toString()}</div>
                    </div>
                    <div className="gppcwrStats">
                          <div className="gppcwrsLeft">likes</div>
                          <div className="gppcwrsRight">{post.likes.toString()}</div>
                    </div>
                  </div>
                  {
                    likeComp.map((o, i) => {
                    return (<React.Fragment key={i}>{o}</React.Fragment>);
                    })
                  }
                  {postSettingsCont}
                  {
                    (post.showAlsoOnPlatform)?(
                      <AlsoOnPlatform
                        socket = {socket}
                        postId = {post._id}
                        platform = {post.platform}
                      />
                    ):('')
                  }
                  {
                    (post.tags && post.tags.length)?(
                        <>
                        <div className="gppcwrSubcat">tags</div>
                        <div className="gppcPostTags">
                        {
                            post.tags.map( (tag, i) => {
                            return (
                                <div className="gppcPostTag" key={i}>{tag}</div>
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
                      pageKey='goodies'
                    />
                  ):('')
                }
               
                
            </div>

        </div>
              </>
            )
          }
          </>
        )}
        </>
      )
      }
      </>
    );
  }
}

export default GoodiesPost;
