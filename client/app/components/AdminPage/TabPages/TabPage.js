import React, { Component } from 'react';
import Func from '../../Classes/Func';

import {
    Link,
    Redirect
  } from 'react-router-dom';

class TabPage extends Component {

  constructor(props){
    super(props);

    this.state = {
      page : null,
      editing : false
    }
  }

  refreshPage = () => {
    const {page} = this.props;
    let cPage = $.extend(true,{}, page);
    this.setState({page : cPage});
  }

  componentDidMount() {
    this.refreshPage();
  }

  updatePageAttr = (k, e) => {
    let {page} = this.state;
    page[k] = e.target.value;
    this.setState({page});
  }

  cancelEditing = () => {
    this.refreshPage();
    this.setState({editing : false});
  }

  updateCategory = (index, k, e) => {
    let {page} = this.state;
    if(index >= page.categories.length) return;
    page.categories[index][k] = e.target.value;
    this.setState({page});
  }

  addNewCat = () => {
    let {page} = this.state;
    let newCat = {
      title : 'title here',
      catKey : 'key here'
    }

    page.categories.push(newCat);
    this.setState({page});
  }

  removeCategory = (index) => {
    let {page} = this.state;
    if(index < 1 || index >= page.categories.length) return;
    page.categories.splice(index, 1);

    this.setState({page});
  }

  savePage = () => {
    const {socket, user} = this.props;
    const {page} = this.state;

    let data = {
      userData : user.getBasic(),
      page
    };

    socket.emit(`client > server edit tabPage`, data);
    this.setState({editing : false});
  }

  render() {
    const {page, editing} = this.state;

    if(!page) return (<></>);
    
    if(editing) {
      let categoriesComps= [];
      categoriesComps.push(
        <div key={0} className="atpiCategoryWrap">
          <div className="atpicType">default</div>
          <div className="atpInputWrap">
            <div className="atpiTitle">category title</div>
            <input type="text" value={page.categories[0].title} onChange={(e) => this.updateCategory(0, 'title', e)} />
          </div>
        </div>
      );

      for(let i = 1; i < page.categories.length; ++i) {
        categoriesComps.push(
          <div key={i} className="atpiCategoryWrap">
            <i className="pufficon-close"
            onClick = {() => this.removeCategory(i)}
            />
            <div className="atpInputWrap">
              <div className="atpiTitle">category title</div>
              <input type="text" value={page.categories[i].title} onChange={(e) => this.updateCategory(i, 'title', e)} />
              <div className="atpiTitle">category key</div>
              <input type="text" value={page.categories[i].catKey} onChange={(e) => this.updateCategory(i, 'catKey', e)} />
            </div>
          </div>
        );
      }

      categoriesComps.push(
        <div key="newCat" className="btn" onClick={this.addNewCat}>add new category</div>
      );
      return (
      <>
        <div className="adminTapPageWrap editing">
          <div className="atpInputWrap">
            <div className="atpiTitle">title</div>
            <input type="text" value={page.title} onChange={(e) => this.updatePageAttr('title', e)} />
          </div>
          <div className="atpInputWrap">
            <div className="atpiTitle">description</div>
            <textarea className="inputLike" value={page.description} onChange={(e) => this.updatePageAttr('description', e)}  />
          </div>

          <div className="atpInputWrap">
            <div className="atpiTitle">featured items title</div>
            <input type="text" value={page.featuredItemsTitle} onChange={(e) => this.updatePageAttr('featuredItemsTitle', e)} />
          </div>

          <div className="atpInputWrap">
            <div className="atpiTitle">search placeholder</div>
            <input type="text" value={page.searchPlaceholder} onChange={(e) => this.updatePageAttr('searchPlaceholder', e)} />
          </div>

          <div className="atpInputWrap">
            <div className="atpiTitle">categories</div>
            <div className="atpiCategories">
            {categoriesComps}
            </div>
          </div>

          <div className="atpBtns">
          <div className="btn primary"
          onClick = {this.savePage}
          >save</div>
          <div className="btn"
          onClick = {this.cancelEditing}
          >cancel</div>
          </div>
        </div>
      </>
      );
    }

    return (
      <>
        <div className="adminTapPageWrap">
          <div className="atpTitle">{page.title}</div>
          <div className="atpKey">{page.pageKey}</div>
          <div className="atpDesc" dangerouslySetInnerHTML={{__html : page.description}} />
          <div className="btn"
          onClick = {() => this.setState({editing: true})}
          >edit</div>
        </div>
      </>
    );
  }
}

export default TabPage;
