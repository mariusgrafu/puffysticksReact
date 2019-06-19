import React, { Component } from 'react';
import PageFollow from './PageFollow';

class TabPageHeader extends Component {

  constructor(props){
    super(props);
  }

  render() {
    const {parentLoading, colors, title, description, pageId, pageKey, socket, user, followers} = this.props;

    return (
      <>
      {
          (parentLoading)?(
            <div className="tabPageHeader">
                <div className="mainWrap">
                <div className="tbhInfo">
                    <div className="tbhiTitle loading" />
                    <div className="tbhiDescr loading" />
                </div>
                {/* <PageFollow
                    parentLoading = {parentLoading}
                    user = {user}
                /> */}
                </div>
            </div>
          )
          :(
            <div className="tabPageHeader">
            <div className="mainWrap">
                <div className="tbhInfo">
                    <div className="tbhiTitle">
                        {title} 
                        <span className="tbhiTitleDot" style={{backgroundColor : colors._active.accent}} />
                    </div>
                    <div className="tbhiDescr">{description}</div>
                </div>
                <PageFollow
                    parentLoading = {parentLoading}
                    pageId = {pageId}
                    key={pageId}
                    followers = {followers}
                    pageKey = {pageKey}
                    socket = {socket}
                    user = {user}
                />
            </div>
        </div>
          )
      }
        
      </>
    );
  }
}

export default TabPageHeader;
