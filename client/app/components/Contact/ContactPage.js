import React, { Component } from 'react';

import TabPage from '../TabPage/TabPage';
import { Link } from 'react-router-dom';
import ContactForm from './ContactForm';

class ContactPage extends TabPage {

  constructor(props){
    super(props);

    this.state = {
        contactFormActive : false,
        contactMessages : [],
        socialLinks : []
    };
  }

  updateSocialLinks = (socialLinks) => {
      this.setState({socialLinks});
  }

  refreshSocialLinks = () => {
      const {socket} = this.props;
      socket.emit(`client > server get socialLinks`, this.updateSocialLinks);
  }

  updateContactMessages = (contactMessages) => {
      this.setState({contactMessages});
  }

  refreshContactMessages = () => {
      const {socket, user} = this.props;
      let data = {
          userId : user._id
      }

      socket.emit(`client > server get user ContactMessages`, data, this.updateContactMessages);
  }

  componentDidMount () {
      const {socket} = this.props;

      this.refreshSocialLinks();

      this.refreshContactMessages();

      socket.on(`server > client refresh socialLinks`, this.refreshSocialLinks);
  }

  render() {
    const {user, socket} = this.props;
    const {contactFormActive, socialLinks, contactMessages} = this.state;
    
    let canSendMessage = user.canThey('sendContactMessage');

    let loggedMessage = ``;
    if(user.isLogged()){
        loggedMessage = ` or get in touch with us through our contact form down below`;
    }

    let activeContactComp = (<></>);

    if (contactFormActive && canSendMessage) {
        activeContactComp = (
            <ContactForm
            user = {user}
            socket = {socket}
            closeForm = {() => this.setState({contactFormActive : false})}
            />
        );
    } else {
        let socialLinksComp = [];
        if(socialLinks.length){
            socialLinks.map( (socialLink, i) => {
                socialLinksComp.push(
                    <a key={i} href={socialLink.address.link} target="_blank" className="contactPageSocialLink noSelect">
                        <i className={`pufficon-${socialLink.key} socialLinkIcon`} />
                        <span className="socialLinkTitle">{socialLink.title}</span>
                    </a>
                );
            });
        }
        let contactPageBtnsComp = (<></>);
        if(canSendMessage) {
            contactPageBtnsComp = (
                <div className="contactPageBtns">
                    <div className="btn primary" onClick={() => this.setState({contactFormActive : true})}>contact us</div>
                </div>
            );
        }

        let contactMessagesWrap = (<></>);

        if(user.isLogged() && contactMessages.length) {
            let contactMessagesComps = [];
            contactMessages.map( (contactMessage, i) => {
                contactMessagesComps.push(
                    <Link
                    to={`/contact/${contactMessage._id}`}
                    key={i} className="contactMessageItem">
                    {contactMessage.title}
                    </Link>
                );
            });

            contactMessagesWrap = (
                <div className="contactMessagesItems">
                    {contactMessagesComps}
                </div>
            );
        }

        activeContactComp = (
            <>
            <div className="contactPageTitle">social links</div>
            <div className="contactPageDesc">send us a message on our social media{loggedMessage}</div>

            <div className="contactPageSocialLinks">
                {socialLinksComp}
            </div>

            {contactMessagesWrap}

            {contactPageBtnsComp}            
            </>
        );
    }

    return (
      <>
        <div className="contactPageWrap">
            <div className="mainWrap">
                {activeContactComp}
            </div>
        </div>
      </>
    );
  }
}

export default ContactPage;
