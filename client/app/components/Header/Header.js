import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import TopLogo from '../Logos/topLogo';
import UserBox from '../Header/UserBox';
import NavMenu from '../Header/NavMenu';

class Header extends Component{

  render(){
      const {navLinks} = this.props;
      return (
      <header className="mainHeader">

        <div className="mainWrap">

          <NavMenu navLinks = {navLinks} colors = {this.props.colors} activeTab = {this.props.activeTab}/>
        
          <Link to="/">
            <TopLogo 
              colors={this.props.colors}
            />
          </Link>

          <UserBox 
            user = {this.props.user}
            colors = {this.props.colors}
            socket = {this.props.socket}
          />

        </div>
      </header>
      );
  }

}; 

export default Header;
