import React from 'react';
import { Link } from 'react-router-dom';

import FooterLinksColumn from './FooterLinksColumn';

class Footer extends React.Component{

  constructor (props) {
    super(props);

    this.state = {
      hasChangelog : false
    }
  }

  updateChangelog = (hasChangelog) => {
    this.setState({hasChangelog});
  }

  componentDidMount () {
    const {socket} = this.props;

    socket.emit(`client > server has main Changelog`, this.updateChangelog);
  }

  render(){
    const {hasChangelog} = this.state;

    let changelogBtn = (<></>);

    if(hasChangelog) {
      changelogBtn = (
        <Link to="/changelog" className="btn">changelog</Link>
      );
    }

    return (
      <footer>
        <div className="mainWrap">
          <div className="footerLogo"></div>
          <div className="footerLinksBox">
            <FooterLinksColumn 
              title = "navigation"
              links = {this.props.navLinks}
              external = {false}
            />

            <FooterLinksColumn 
              title = "social media"
              links = {this.props.socialLinks}
              external = {true}
            />

            <div className="footerLinksBoxBtns">
              <Link to = "/contact" className="btn primary">say hi</Link>
              <Link to = "/support/new" className="btn">report a bug</Link>
              {changelogBtn}
            </div>
          </div>
          <div className="footerLinksWrap">
            <Link to="/policy" className="footerLink">privacy policy</Link>
            <Link to="/terms" className="footerLink">terms of use</Link>
          </div>
          <div className="footerMadeBy">
            made by <span>puffysticks.</span>
          </div>
        </div>
      </footer>
    );
  }

} 

export default Footer;
