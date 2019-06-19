import React, { Component } from 'react';

import BannerSVG from './BannerSVG';
import BannerText from './BannerText';

class MainBanner extends Component {

  render() {
    let {colors} = this.props;
    return (
      <div className="mainBannerContainer">
        <BannerText />
        <BannerSVG colors={colors}/>
      </div>
    );
  }
}

export default MainBanner;
