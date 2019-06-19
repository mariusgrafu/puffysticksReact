import React, { Component } from 'react';

class BannerText extends Component {

  render() {
    return (
      <div className="bannerTextWrap">
        <div className="bannerTextHello">
            <div className="bannerTextHelloSmall">howdy</div>
            <div className="bannerTextHelloBig">webtraveler!</div>
        </div>
        <div className="bannerPlank"></div>
      </div>
    );
  }
}

export default BannerText;
