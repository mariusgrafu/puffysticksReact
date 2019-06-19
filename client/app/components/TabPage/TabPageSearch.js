import React, { Component } from 'react';
import Checkbox from '../Input/Checkbox';
import OrderInput from '../Input/OrderInput';
import { withRouter } from "react-router";
import queryString from 'query-string'

class TabPageSearch extends Component {

  constructor(props){
    super(props);

    this.state = {
        searchBarActive : false,
        showFilters : false,
        searchValue : ``
    }
  }

  searchIconClicked = () => {
      let {searchBarActive} = this.state;
      if(!searchBarActive){
        searchBarActive = !searchBarActive;
        this.setState({searchBarActive});
        return;
      }
  }

  categoriesIconClicked = () => {
      let {searchBarActive} = this.state;
      searchBarActive = false;
      this.setState({searchBarActive});
  }

  applyFilters = () => {
      let {filter, updateFilter} = this.props;
      if(!filter || !filter.length) return;
      const parent = $('.searchFilterCont');
      for(let i in filter){
        switch(filter[i].type){
            case 'checkbox':
            filter[i].state = parent.find(`.checkbox[name=${filter[i].key}]`).attr('data-checked');
            break;
            case 'order':
            filter[i].state = parent.find(`.orderInput[name=${filter[i].key}]`).attr('data-direction');
            break;
        }
      }
      updateFilter(filter);
      this.setState({showFilters: false});
  }

  showFiltersOn = () => {
      this.setState({showFilters : true});
  }

  showFiltersOff = () => {
      this.setState({showFilters : false});
  }

  componentDidMount(){

    $(document).mouseup((e) => {
        var container = $(".searchFilterCont");
    
        if (container.length && !container.is(e.target) && container.has(e.target).length === 0) 
        {
            this.setState({showFilters: false});
        }
    });

    const queryProps = queryString.parse(this.props.location.search);
    if(queryProps.search) {
        this.props.updateSearch(queryProps.search);
        this.setState({searchValue : queryProps.search});
    }

  }

  updateSearch = (e) => {
      const {updateSearch} = this.props;
      updateSearch(e.target.value);
      this.setState({searchValue : e.target.value});
      let searchQuery = ``;
      if(e.target.value !== '') searchQuery = `?search=${e.target.value}`;
      const {history} = this.props;
      history.push(`${history.location.pathname}${searchQuery}`);
  }

  render() {
    const {parentLoading, placeholder, categories, updateActive
        // ,filter
    } = this.props;
    const {searchBarActive,
        searchValue
        // , showFilters
    } = this.state;
    let filter = null;
    let showFilter = false;
    return (
      <>
      {
          (parentLoading)?(
            <div className="tabPageSearch">
            <div className="mainWrap loading" />
            </div>
          ):(
            <div className="tabPageSearch">
            <div className="mainWrap">
                <div className={"searchIcon pufficon-search" + ((searchBarActive)?" isActive":"")} 
                    onClick={this.searchIconClicked}
                />
                {
                    (searchBarActive)?(
                        <div className="searchBarWrap">
                            <input name="searchBar" placeholder={placeholder} onChange={this.updateSearch} value={searchValue} />
                            {
                                (filter && filter.length)?(
                                <div className="searchFilterIconWrap">
                                <i className="searchFilterIcon pufficon-filter" data-tooltip="filter" onClick={this.showFiltersOn} />
                                {
                                    (showFilters)?(
                                        <div className="searchFilterCont">
                                    <div className="sfcTitle">Filter <i className="pufficon-close" onClick={this.showFiltersOff} /></div>
                                    {
                                        filter.map((filterItem, i) => {
                                            let FiType = React.Fragment;
                                            let fiAttr = {};
                                            switch(filterItem.type){
                                                case 'checkbox':
                                                FiType = Checkbox;
                                                fiAttr = {
                                                    checkbox: {
                                                        name : filterItem.key,
                                                        label : filterItem.name,
                                                        checked : filterItem.state
                                                    }
                                                }
                                                break;
                                                case 'order':
                                                FiType = OrderInput;
                                                fiAttr = {
                                                    order : {
                                                        name : filterItem.key,
                                                        label : filterItem.name,
                                                        direction : filterItem.state
                                                    }
                                                }
                                                break;
                                            }
                                            
                                            return(
                                                <div className="sfcFilterItem" key = {i}>
                                                    <FiType {...fiAttr} />
                                                </div>
                                            );
                                        })
                                    }
                                    <div className="sfcBtnWrap">
                                        <div className="btn primary" onClick={this.applyFilters}>apply</div>
                                    </div>
                                </div>
                                    ):('')
                                }
                                </div>
                                ):('')
                            }
                            <i className="searchCategoriesIcon pufficon-menudots" onClick={this.categoriesIconClicked} data-tooltip="back to categories" />
                        </div>
                    ):(
                    <div className="searchCategoriesWrap">
                        {
                            (categories && categories.length)?(
                                categories.map( (category, i) => {
                                    return(
                                        <div
                                        key={i}
                                        className={"searchCategory" + ((category.active)?" isActive":"")} 
                                        onClick={() => updateActive(i)}
                                        >
                                        {category.title}
                                        </div>
                                    );
                                })
                            ):('')
                            
                        }
                    </div>
                    )
                }
                
            </div>
        </div>
          )
      }
        
      </>
    );
  }
}

export default withRouter(TabPageSearch);
