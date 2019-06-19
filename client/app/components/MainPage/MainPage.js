import React, { Component } from 'react';

import TabPage from '../TabPage/TabPage';
import MainBanner from './MainBanner';
import WhatsGood from './WhatsGood';

class MainPage extends TabPage {

  constructor(props){
    super(props);
  }

  render() {
    const {colors} = this.props;

    return (
      <>
      <MainBanner
        colors = {colors}
      />
      <WhatsGood 
        colors = {colors}
        socket = {this.props.socket}
      />
      </>
    );
  }
}

export default MainPage;
