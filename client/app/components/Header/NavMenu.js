import React, { Component } from 'react';

import { Link } from 'react-router-dom';

class NavMenu extends Component{

    constructor(props) {
        super(props);

        this.state = {
            menuTgld : false
        }
    }

    toggleMenu = () => {
        let {menuTgld} = this.state;
        this.setState({menuTgld : !menuTgld});
    }

  render(){
      const {navLinks, activeTab, colors} = this.props;
      const {menuTgld} = this.state;
      if(!navLinks || !navLinks.length) return (<></>);

      let links = [];

      navLinks.map( (link, i) => {
        links.push(
        <React.Fragment key={`${link.key}.${i}`} >
        {
            (link.address.external)?(
            <a
                href={link.address.link}
                target = "_blank"
                key={`${link.key}.${i}`} 
                className={'mainHeaderNavLink' + ((link.key == activeTab)?' isActive':'')}
            > 
                <div className="mhnlTitle">{link.title}</div>
                <div className="mhnlDot" style={{backgroundColor: (colors[link.key] || colors.default).accent}}></div>
            </a>
            ):(
            <Link 
                to={link.address.link}
                key={`${link.key}.${i}`} 
                className={'mainHeaderNavLink' + ((link.key == activeTab)?' isActive':'')}
            > 
                <div className="mhnlTitle">{link.title}</div>
                <div className="mhnlDot" style={{backgroundColor: (colors[link.key] || colors.default).accent}}></div>
            </Link>
            )
        }
        
        </React.Fragment>
        );
    })

    let mobileWrapClass = `mobileMenuToggWrap`;
    if(menuTgld) mobileWrapClass += ` tgld`;
    let mobileMenu = (<></>);
    if(menuTgld) mobileMenu = (<div className="mobileMenuCont">{links}</div>);

      return (
        <>
        <nav>
        {links}
        </nav>

        <div className="mobileMenuWrap">
            <div className={mobileWrapClass} onClick = {this.toggleMenu}>
                <div className="mmtBar" />
                <div className="mmtBar" />
                <div className="mmtBar" />
            </div>
            {mobileMenu}
        </div>
        </>
      );
  }

}; 

export default NavMenu;
