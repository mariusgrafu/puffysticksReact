import React, { Component } from 'react';

class TabPage extends Component {
  
  componentWillMount(){
    const {pageKey} = this.props;
    this.props.setActiveTab(pageKey);
  }

}

export default TabPage;
