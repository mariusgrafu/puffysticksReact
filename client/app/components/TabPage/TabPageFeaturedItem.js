import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Func from '../Classes/Func';

class TabPageFeaturedItem extends Component {

  constructor(props){
    super(props);

    this.state = {
        isLiked : false
    }
  }

  updateIsLiked = (isLiked) => {
      this.setState({isLiked});
  }

  likePost = (e) => {
      e.preventDefault();
      let {isLiked} = this.state;
      const {socket, user, item, pageId, pageKey} = this.props;
      if(isLiked || !user.isLogged()) return;
      socket.emit('client > server likePost', user.getBasic(), item._id, pageId, pageKey);
  }

  unlikePost = (e) => {
      e.preventDefault();
      let {isLiked} = this.state;
      const {socket, user, item, pageId, pageKey} = this.props;
      if(!isLiked || !user.isLogged()) return;
      socket.emit('client > server unlikePost', user.getBasic(), item._id, pageId, pageKey);
  }

  componentDidMount(){
      const {socket, item, pageId, updateLikes, updateViews, pageKey, user} = this.props;
      socket.on(`server > client updateLike ${pageId} ${item._id}`, (newLikes) => {
        updateLikes(item._id, newLikes);
      });
      switch(pageKey){
          case 'blog':
          socket.on(`server > client newView blogPost ${item._id}`, (newViews) => updateViews(item._id, newViews));
          break;
          case 'portfolio':
          socket.on(`server > client newView portfolioPost ${item._id}`, (newViews) => updateViews(item._id, newViews));
          break;
          case 'goodies':
          socket.on(`server > client newView goodiesPost ${item._id}`, (newViews) => updateViews(item._id, newViews));
          break;
      }
      if(user.isLogged())
        socket.emit('client > server isLiked', user.getBasic(), item._id, pageId, this.updateIsLiked);
  }

//   componentDidUpdate(prevProps){
//       if(prevProps == this.props) return;
//       const {socket, item, pageId, user} = this.props;
//       if(user.isLogged())
//         socket.emit('client > server isLiked', user.getBasic(), item._id, pageId, this.updateIsLiked);
//   }

  render() {
    const {item, colors, user, pageKey} = this.props;
    let {isLiked} = this.state;
    let itemCoverStyle = {};
    
    if(item.thumbnail != undefined && item.thumbnail != '') itemCoverStyle.style = {backgroundImage : `url(${item.thumbnail})`};
    else if(item.cover) itemCoverStyle.style = {backgroundImage : `url(${item.cover})`};
    else if(pageKey == 'portfolio'){
        itemCoverStyle.style = {backgroundImage : `url(${item.images[0]})`};
    }
    let likeIconClassName = "pufficon-like";
    if(isLiked) likeIconClassName = "pufficon-liked isLiked";
    let likeAttr = {};
    let likesContClass = 'tpfiidsrLikes';
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

    return(
        <>
        <Link to = {`/${pageKey}/${item._id}/${Func.speakingUrl(item.title)}`}
        className="tpfiItemCont" key={item._id}>
            <div className="tpfiItemCover" {... itemCoverStyle} />
            <div className="tpfiItemDetails">
                <div className="tpfiidTop">
                {
                    (pageKey == 'blog')?(
                        (item.author)?(
                            <div 
                                className="tpfiidtAuthor"
                                style={{backgroundImage: `url(${item.author.avatar})`}}
                            />
                        ):(
                            <i 
                                className="pufficon-logo"
                                style={{color: colors._active.accent}}
                            />
                        )
                    ):('')
                }
                <div className="tpfiidTitle">
                    {item.title}
                </div>
                </div>
                <div className="tpfiidStats">
                    <div className="tpfiidsLeft">
                        <div className="tpfiidslDate">{Func.formatDateFeaturedItems(item.postDate)}</div>
                    </div>
                    <div className="tpfiidsRight noSelect">
                        <div className={likesContClass}>
                            <i className={likeIconClassName} {...likeAttr} />
                            {item.likes.toLocaleString()}
                        </div>
                        <div className="tpfiidsrViews">
                            <i className="pufficon-view" />
                            {item.views.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
        </>
    );
  }
}

export default TabPageFeaturedItem;
