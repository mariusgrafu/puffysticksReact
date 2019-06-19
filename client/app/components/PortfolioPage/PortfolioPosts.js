import React, { Component } from 'react';
import PortfolioPost from './PortfolioPost';
import TabPagePagination from '../TabPage/TabPagePagination';

class PortfolioPosts extends Component {

  constructor(props){
    super(props);

    this.state = {
        loading : true,
        pageCount : 1,
        posts : []
    }

  }

  updatePosts = (posts) => {
    this.setState({posts, loading : false});
  }

  updatePageCount = (pageCount) => {
      pageCount = Math.ceil(pageCount/24);
      this.setState({pageCount : pageCount});
  }

  updateLikes = (id, newLikes) => {
      let {posts} = this.state;
      for(let i in posts){
          if(posts[i]._id == id){
              posts[i].likes = newLikes;
              break;
          }
      }
      this.setState({posts});
  }

  updateViews = (id, newViews) => {
    let {posts} = this.state;
      for(let i in posts){
          if(posts[i]._id == id){
              posts[i].views = newViews;
              break;
          }
      }
      this.setState({posts});
  }
  
  refreshPortfolioPosts = () => {
    const {socket, activeCategory, search, filter, currentPage, user} = this.props;
    if(!socket || !activeCategory) return;
    let onlyVisible = true;
    if(user && user.canThey('editPortfolioPosts')) {
        onlyVisible = false;
    }
    
    let data = {
      catKey : activeCategory.catKey,
      search,
      filter,
      currentPage,
      onlyVisible
    };
    
    socket.emit(`client > server get portfolioPosts`, data, this.updatePosts);
    socket.emit(`client > server get portfolioPosts pageCount`,  data, this.updatePageCount);
  }

  componentDidUpdate(prevProps){
      if(prevProps == this.props) return;
      this.refreshPortfolioPosts();
  }
  componentDidMount(){
    const {socket} = this.props;
    this.refreshPortfolioPosts();
    socket.on(`server > client refresh portfolioPosts`, () => this.refreshPortfolioPosts());
  }

  render() {
    const {parentLoading, pageId, colors, user, socket, currentPage, gotoPage} = this.props;
    const {loading, posts, pageCount} = this.state;
    let loadingItems = [];

    for(let i = 0; i < 24; ++i){
        loadingItems.push(<PortfolioPost key={i} parentLoading={true} />);
    }
      
    return (
      <>
    <div className="portfolioPostsCont">
        <div className="mainWrap">
            <div className="portfolioPostsWrap">
                {
                    (parentLoading || loading)?(
                        <>
                        {loadingItems}
                        </>
                    ):(
                        <>
                        {
                            (posts.length)?(
                                <>
                                {
                                    posts.map( (post, i) => {
                                        return(
                                            <PortfolioPost
                                            key = {i}
                                            index = {i}
                                            post = {post}
                                            colors = {colors}
                                            user = {user}
                                            socket = {socket}
                                            pageId = {pageId}
                                            updateLikes = {this.updateLikes}
                                            updateViews = {this.updateViews}
                                            />
                                        );
                                        
                                    })
                                }
                                </>
                            ):(
                                <div className="tabPageNoPostsFound">
                                    no posts matching your criteria
                                </div>
                            )
                        }
                        </>
                    )
                }
            </div>
        </div>
    </div>

    <TabPagePagination
        parentLoading = {(parentLoading || loading)}
        currentPage = {currentPage}
        pageCount = {pageCount}
        colors = {colors}
        gotoPage = {gotoPage}
    />
        
      </>
    );
  }
}

export default PortfolioPosts;
