import React, { Component } from 'react';
import BlogPost from './BlogPost';
import TabPagePagination from '../TabPage/TabPagePagination';

class BlogPosts extends Component {

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

  refreshBlogPosts = () => {
    const {socket, activeCategory, search, filter, currentPage, user} = this.props;
    if(!socket || !activeCategory) return;
    let onlyVisible = true;
    if(user && user.canThey('editBlogPosts')) {
        onlyVisible = false;
    }
    // console.log('oV', onlyVisible, user.canThey('writeBlogPosts'), user.canThey('editBlogPosts'));
    let data = {
      catKey : activeCategory.catKey,
      search,
      filter,
      currentPage,
      onlyVisible
    };
    
    socket.emit(`client > server get blogPosts`, data, this.updatePosts);
    socket.emit(`client > server get blogPosts pageCount`,  data, this.updatePageCount);
  }

  componentDidUpdate(prevProps){
      if(prevProps == this.props) return;
      this.refreshBlogPosts();
  }

  componentDidMount(){
    const {socket} = this.props;
    this.refreshBlogPosts();
    socket.on(`server > client refresh blogPosts`, () => this.refreshBlogPosts());
  }

  render() {
    const {parentLoading, pageId, colors, user, socket, currentPage, gotoPage} = this.props;
    const {loading, posts, pageCount} = this.state;
    let loadingItems = [];

    for(let i = 0; i < 24; ++i){
        loadingItems.push(<BlogPost key={i} parentLoading={true} />);
    }
      
    return (
      <>
    <div className="blogPostsCont">
        <div className="mainWrap">
            <div className="blogPostsWrap">
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
                                            <BlogPost
                                            key = {post._id}
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

export default BlogPosts;
