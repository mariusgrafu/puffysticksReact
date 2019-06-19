import React, { Component } from 'react';

import TabPage from '../TabPage/TabPage';
import TabPageHeader from '../TabPage/TabPageHeader';
import TabPageSearch from '../TabPage/TabPageSearch';
import TabPageFeaturedItems from '../TabPage/TabPageFeaturedItems';
import BlogPosts from './BlogPosts';
import { Link } from 'react-router-dom';

class BlogPage extends TabPage {

  constructor(props){
    super(props);

    this.state = {
        loading : true,
        page : {},
        activeCategory : null,
        search : '',
        currentPage : 1,
        filter : [
            {
                name : 'order',
                key : 'order',
                type : 'order',
                state : 'desc'
            },
            {
                name : 'featured only',
                key : 'featuredOnly',
                type : 'checkbox',
                state : false
            }
        ]
    };
  }

  gotoPage = (page) => {
      this.setState({currentPage : page});
  }

  updatePage = (page) => {
      let {activeCategory} = this.state;
      if(page){
            for(let i in page.categories){
                page.categories[i].active = page.categories[i].default;
                if(page.categories[i].default){
                    activeCategory = page.categories[i];
                    activeCategory.index = i;
                }
            }
      }
      this.setState({page, activeCategory, loading : false});
  }

  updateFilter = (filter) => {
      this.setState({filter, currentPage : 1});
  }

  updateSearch = (search) => {
      this.setState({search, currentPage : 1});
  }

  updateActive = (index) => {
      let {activeCategory, page} = this.state;
      if(activeCategory.index == index) return;
      if(index < 0 || index >= page.categories.length) return;
      page.categories[index].active = true;
      page.categories[activeCategory.index].active = false;
      activeCategory = page.categories[index];
      activeCategory.index = index;
      this.setState({activeCategory, page});
  }

  componentDidMount() {
    const {socket} = this.props;
    
    socket.on(`server > client blog page update followers`, (followers) => {
        let {page} = this.state;
        page.followers = followers;
        this.setState({page});
    });
  }

  componentWillMount(){
      super.componentWillMount();
      const {socket} = this.props;
      // get page details from the server
      socket.emit('client > server get tabPage', 'blog', this.updatePage);
  }

  render() {
    const {colors, user, socket} = this.props;
    const {page, loading, filter, currentPage, activeCategory, search} = this.state;

    let newPostComp = (<></>);

    if(user.canThey('writeBlogPosts')){
        newPostComp = (
            <div className="tpSettingsCont">
                <div className="mainWrap">
                    <div className="tpSettingsBtns">
                        <Link to="/blog/new" className="btn primary">new blog post</Link>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
      <>
        <TabPageHeader 
            title = {page.title}
            description = {page.description}
            pageId = {page._id}
            pageKey = {page.pageKey}
            followers = {page.followers}
            parentLoading = {loading}
            colors = {colors}
            socket = {socket}
            user = {user}
        />
        <TabPageSearch
            placeholder = {page.searchPlaceholder}
            categories = {page.categories}
            updateActive = {this.updateActive}
            filter = {filter}
            updateFilter = {this.updateFilter}
            pageId = {page._id}
            updateSearch = {this.updateSearch}
            parentLoading = {loading}
            socket = {socket}
            user = {user}
        />
        {newPostComp}
        {
            (currentPage == 1 && user.preferences.showFeaturedBlogPosts)?(
                <TabPageFeaturedItems
                title = {page.featuredItemsTitle}
                key = {page.pageKey}
                pageKey = {page.pageKey}
                pageId = {page._id}
                colors = {colors}
                parentLoading = {loading}
                socket = {socket}
                user = {user}
                />
            ):('')
        }
        <BlogPosts
            key={activeCategory}
            parentLoading = {loading}
            activeCategory = {activeCategory}
            search = {search}
            filter = {filter}
            currentPage = {currentPage}
            colors = {colors}
            pageId = {page._id}
            socket = {socket}
            user = {user}
            gotoPage = {this.gotoPage}
        />
        
      </>
    );
  }
}

export default BlogPage;
