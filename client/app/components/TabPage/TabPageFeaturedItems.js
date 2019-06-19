import React, { Component } from 'react';
import TabPageFeaturedItem from './TabPageFeaturedItem';

class TabPageFeaturedItems extends Component {

  constructor(props){
    super(props);

    this.state = {
        visible : true,
        items : []
    }
  }

  fadeElements = () => {
    let cont = $(".tpfiItemsWrap");
    if(!cont.length) return;
    // let cont = $("body");
    let bar = cont.outerWidth() + cont.offset().left;
    $('.tpfiItemCont').each(function() {
        let d = $(this).offset().left + $(this).outerWidth();
        let x = Math.max(0, 90 - (((d - bar)*100)/$(this).outerWidth()));
        let b = (((d - bar)*5)/$(this).outerWidth());
        x = Math.min(100, x + 10);
        b = Math.min(5, b);
        if(d > bar){
            $(this).css({opacity: x/100});
            $(this).find('.tpfiItemCover').css({filter: `blur(${b}px)`});
        }else{
            $(this).css({opacity: 1});
            $(this).find('.tpfiItemCover').css({filter: 'blur(0)'});
        }
    });
  }

  updateItems = (items) => {
      this.setState({items}, () => this.fadeElements());
  }

  updateLikes = (id, newLikes) => {
      let {items} = this.state;
      for(let i in items){
        if(items[i]._id == id){
            items[i].likes = newLikes;
            break;
        }
      }
      this.setState({items});
  }

  updateViews = (id, newViews) => {
      let {items} = this.state;
      for(let i in items){
        if(items[i]._id == id){
            items[i].views = newViews;
            break;
        }
      }
      this.setState({items});
  }

//   componentDidUpdate(prevProps){
//     this.fadeElements();
//       if(prevProps == this.props) return;
//       const {pageKey, socket} = this.props;

//       if(pageKey){
//         // get featuredItems from the server
//         socket.emit('client > server get featuredItems', pageKey, this.updateItems);
//       }
//   }

  refreshFeaturedItems = () => {
    const {pageKey, socket} = this.props;

    if(pageKey){
    // get featuredItems from the server
    socket.emit('client > server get featuredItems', pageKey, this.updateItems);
    }
  }

  componentDidMount(){
    $(window).on('resize', () => this.fadeElements());
    this.refreshFeaturedItems();
    const {socket, pageKey} = this.props;
    switch(pageKey) {
        case 'blog':
        socket.on(`server > client refresh blogPosts`, () => this.refreshFeaturedItems());
        break;
        case 'portfolio':
        socket.on(`server > client refresh portfolioPosts`, () => this.refreshFeaturedItems());
        break;
        case 'goodies':
        socket.on(`server > client refresh goodiesPosts`, () => this.refreshFeaturedItems());
        break;
    }
  }

  closeFeaturedItems = () => {
      const {pageKey, user} = this.props;
    switch(pageKey) {
        case 'blog' :
        user.updatePrefs('showFeaturedBlogPosts', false);
        break;
        case 'portfolio' :
        user.updatePrefs('showFeaturedPortfolioPosts', false);
        break;
        case 'goodies' :
        user.updatePrefs('showFeaturedGoodiesPosts', false);
        break;
    }
  }

  render() {
    const {parentLoading, title, colors, user, socket, pageId, pageKey} = this.props;
    let {visible, items} = this.state;
    if(items && !items.length || !items) visible = false;
    return (
      <>
        {
            (visible)?(
                (parentLoading)?(
                    <div className="tabPageFeaturedItemsCont">
                    <div className="mainWrap">
                        <div className="tpfiTopWrap">
                            <div className="tpfitTitle loading" />
                        </div>
                        <div className="tpfiItemsWrap">
                        <div className="tpfiItemCont loading" />
                        <div className="tpfiItemCont loading" />
                        <div className="tpfiItemCont loading" />
                        <div className="tpfiItemCont loading" />
                        <div className="tpfiItemCont loading" />
                        </div>
                    </div>
                    </div>
                ):(
                <div className="tabPageFeaturedItemsCont">
                    <div className="mainWrap">
                        <div className="tpfiTopWrap">
                            <div className="tpfitTitle">{title}</div>
                            {
                                (user.isLogged())?(
                                    <i className="pufficon-close"
                                    onClick={this.closeFeaturedItems}
                                    />
                                ):('')
                            }
                            
                        </div>
                        <div className="tpfiItemsWrap">
                        {
                            items.map((item, i) => {
                                return(
                                    <TabPageFeaturedItem
                                        key = {`${item._id}${pageKey}${item.likes}`}
                                        colors = {colors}
                                        index = {i}
                                        item = {item}
                                        socket = {socket}
                                        user = {user}
                                        pageKey = {pageKey}
                                        pageId = {pageId}
                                        updateLikes = {this.updateLikes}
                                        updateViews = {this.updateViews}
                                    />
                                )
                            })
                        }
                        </div>
                    </div>
                </div>
                )
            ):('')
        }
      </>
    );
  }
}

export default TabPageFeaturedItems;
