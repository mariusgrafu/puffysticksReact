import React, { Component } from 'react';
import TabPage from '../TabPage/TabPage';
import Func from '../Classes/Func';

import NotFound from '../App/NotFound';

import SiteSettings from './SiteSettings';
import TabPages from './TabPages/TabPages';
import NavLinks from './NavLinks/NavLinks';
import SocialLinks from './SocialLinks/SocialLinks';
import Groups from './Groups/Groups';
import Accounts from './Accounts/Accounts';
import WhatsGood from './WhatsGood/WhatsGood';
import Reports from './Reports/Reports';
import Changelogs from './Changelogs/Changelogs';

import {
    Link,
    Redirect
  } from 'react-router-dom';

class AdminPage extends TabPage {

  constructor(props){
    super(props);

    this.state = {
        links : [
            {
                key : 'siteSettings',
                title : 'site settings',
                url : '/admin/siteSettings'
            },
            {
                key : 'tabPages',
                title : 'tab pages',
                url : '/admin/tabPages'
            },
            {
                key : 'navLinks',
                title : 'nav links',
                url : '/admin/navLinks'
            },
            {
                key : 'socialLinks',
                title : 'social links',
                url : '/admin/socialLinks'
            },
            {
                key : 'groups',
                title : 'groups',
                url : '/admin/groups'
            },
            {
                key : 'users',
                title : 'users',
                url : '/admin/users'
            },
            {
                key : 'whatsGood',
                title : `what's good`,
                url : '/admin/whatsGood'
            },
            {
                key : 'reports',
                title : `reports`,
                url : '/admin/reports'
            },
            {
                key : 'changelogs',
                title : `changelogs`,
                url : '/admin/changelogs'
            }
        ]
    }
  }

  render() {
    const {setActiveTab, colors, user, socket} = this.props;
    let {section} = this.props;
    section = section || 'siteSettings';
    const {links} = this.state;

    if(!user.isStaff()) {
        return (
            <NotFound 
                setActiveTab = {setActiveTab}
                pageKey = ''
                colors = {colors}
                user = {user}
            />
        );
    }

    let sectionComp = (<></>);

    switch(section) {
        case 'siteSettings' : 
        sectionComp = (
            <SiteSettings
                user = {user}
                socket = {socket}
            />
        );
        break;
        case 'tabPages' : 
        sectionComp = (
            <TabPages
                user = {user}
                socket = {socket}
            />
        );
        break;
        case 'navLinks' : 
        sectionComp = (
            <NavLinks
                user = {user}
                socket = {socket}
            />
        );
        break;
        case 'socialLinks' : 
        sectionComp = (
            <SocialLinks
                user = {user}
                socket = {socket}
            />
        );
        break;
        case 'groups' : 
        sectionComp = (
            <Groups
                user = {user}
                socket = {socket}
            />
        );
        break;
        case 'users' : 
        sectionComp = (
            <Accounts
                user = {user}
                socket = {socket}
            />
        );
        break;
        case 'whatsGood' : 
        sectionComp = (
            <WhatsGood
                user = {user}
                socket = {socket}
            />
        );
        break;
        case 'reports' : 
        sectionComp = (
            <Reports
                user = {user}
                socket = {socket}
            />
        );
        break;
        case 'changelogs' : 
        sectionComp = (
            <Changelogs
                user = {user}
                socket = {socket}
            />
        );
        break;
    }

    return (
      <>
        <div className="adminPageCont">
        <div className="adminPageTopNav">
            <div className="mainWrap">
            {
                links.map( (link) => {
                    return (
                        <Link key={link.key} to={link.url}
                        className={`aptnLink${((section == link.key)?(' selected'):(''))}`}
                        >{link.title}
                        </Link>
                    );
                })
            }
            </div>
        </div>

        {sectionComp}
        
        </div>
      </>
    );
  }
}

export default AdminPage;
