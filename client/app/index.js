import React from 'react';
import { render } from 'react-dom';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect
} from 'react-router-dom';

import App from './components/App/App';
import Overlay from './components/Overlay/Overlay';
import NotFound from './components/App/NotFound';

import MainPage from './components/MainPage/MainPage';
import ChangelogPage from './components/ChangelogPage/ChangelogPage';
import BlogPage from './components/BlogPage/BlogPage';
import PortfolioPage from './components/PortfolioPage/PortfolioPage';
import GoodiesPage from './components/GoodiesPage/GoodiesPage';

import BlogPost from './components/BlogPost/BlogPost';
import PortfolioPost from './components/PortfolioPost/PortfolioPost';
import GoodiesPost from './components/GoodiesPost/GoodiesPost';

import NewBlogPost from './components/BlogPost/NewBlogPost';
import NewPortfolioPost from './components/PortfolioPost/NewPortfolioPost';
import NewGoodiesPost from './components/GoodiesPost/NewGoodiesPost';

import BugReport from './components/BugReport/BugReport';
import NewBugReport from './components/BugReport/NewBugReport';

import ProfilePage from './components/ProfilePage/ProfilePage';

import ContactPage from './components/Contact/ContactPage';
import ContactMessage from './components/Contact/ContactMessage';

import Register from './components/Signup/Register';
import Login from './components/Signup/Login';

import AdminPage from './components/AdminPage/AdminPage';

import OfflineSite from './components/OfflineSite/OfflineSite';

import Terms from './components/Terms/Terms';

//classes
import User from './components/Classes/User';
import WarnMessages from './components/Classes/WarnMessages';

import './styles/styles.scss';

const io = require('socket.io-client');
const socket = io();

class Body extends React.Component{ 

  constructor(props){
    super(props);

    this.state = {
      navLinks : [{
          title : '',
          address : {
            external : false,
            link : '/'
          },
          key : ''
      }],
      colors: {
        default: {
          accent: '#8E3BEB',
          text: '#E9DFF7'
        },
        _active : {
          accent: '#8E3BEB',
          text: '#E9DFF7'
        }
      },
      activeTab: -1,
      socialLinks: [{
        title : '',
        address : {
          external : false,
          link : '/'
        },
        key : ''
    }],
      user : new User(),
      warnMessages : new WarnMessages(),
      siteSettings : null
    }
  }

  initUpdates = () => {
    let {warnMessages, user} = this.state;

    warnMessages.update = this.updateWarnMessages;
    user.update = this.updateUser;
    user.socket = socket;

    this.setState({warnMessages, user});
  }

  updateWarnMessages = () => {
    const {warnMessages} = this.state;
    this.setState({warnMessages});
  }

  updateUser = () => {
    const {user} = this.state;
    this.setState({user});
  }

  updateNavLinks = (navLinks) => {
    this.setState({navLinks});
  }

  updateSocialLinks = (socialLinks) => {
    this.setState({socialLinks});
  }

  updateColors = (colors) => {
    colors._active = colors[this.state.activeTab] || colors.default;
    this.setState({colors});
  }

  componentDidMount(){
    $(window).on('beforeunload', function(){
      socket.close();
    });

    let tooltipTimeout;

    $(document).on('mouseover', '[data-tooltip]', function(e) {
      clearTimeout(tooltipTimeout);
      $(".tooltip").remove();
      let expire = $(this).attr("data-expire");
      if(expire == undefined) expire = 1500;
      let text = $(this).attr("data-tooltip");
      let top = $(this).offset().top;
      let left = e.pageX;
      left -= 15;
      $("body").prepend(`
      <div class="tooltip" style="top: ${top}px; left: ${left}px;">${text}</div>
      `);
      tooltipTimeout = setTimeout(() => {
        $('.tooltip').remove();
      }, expire);
    });

    $(document).on('mouseleave', '[data-tooltip]', function() {
      clearTimeout(tooltipTimeout);
      $(".tooltip").remove();
    });

  }

  updateSiteSettings = (siteSettings) => {
    let colors = {};
    for(let i in siteSettings.colors){
      colors[siteSettings.colors[i].key] = siteSettings.colors[i].value;
    }
    this.setState({siteSettings, colors});
  }

  refreshSiteSettings = () => {
    socket.emit(`client > server get siteSettings`, this.updateSiteSettings);
  }

  componentWillMount(){

    // get navLinks from server
    socket.emit('client > server get navLinks', this.updateNavLinks);
    // get socialLinks from server
    socket.emit('client > server get socialLinks', this.updateSocialLinks);
    // get site settings
    this.refreshSiteSettings();

    //init updates
    this.initUpdates();
    this.state.user.initData();

    socket.on(`server > client refresh siteSettings`, this.refreshSiteSettings);

  }

  setActiveTab = (tabkey) => {
    this.setState({activeTab: tabkey});
    const {colors} = this.state;
    this.updateColors(colors);
  }

  render(){
    const USER = this.state.user;
    const {activeTab, colors, siteSettings} = this.state;
    if(!siteSettings) return (<></>);
    colors._active = colors[activeTab] || colors.default;
    if(!USER._ready) return (<></>);
    return(
    <Router>
      <>
        <Overlay
          warnMessages = {this.state.warnMessages}
          user = {USER}
          key={'Overlay' + (USER.getBasic().userId || '')}
        />
        <App 
        navLinks = {this.state.navLinks}
        colors = {this.state.colors}
        activeTab = {this.state.activeTab}
        socialLinks = {this.state.socialLinks}
        user = {USER}
        socket = {socket}
        key={'App' + (USER.getBasic().userId || '')}
        >
            {
              (!siteSettings.siteOnline && !USER.isStaff())?(
                <Switch>
                <Route path="/login" >
                {
                    (USER.isLogged())?(
                      <Redirect to="/" />
                    ):(
                    <Login
                      setActiveTab = {this.setActiveTab}
                      pageKey = 'login'
                      colors = {this.state.colors}
                      socket = {socket}
                      addWarnMessage = {this.state.warnMessages.addMessage}
                      user = {USER}
                    />
                    )
                  }
                </Route>
                <Route path="/policy">
                  <Terms
                    setActiveTab = {this.setActiveTab}
                    key = {`policy`}
                    type = "policy"
                    pageKey = 'policy'
                    colors = {this.state.colors}
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                </Route>
                <Route path="/terms">
                  <Terms
                    setActiveTab = {this.setActiveTab}
                    key = {`terms`}
                    type = "terms"
                    pageKey = 'terms'
                    colors = {this.state.colors}
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                </Route>
                <Route>
                  <OfflineSite
                    setActiveTab = {this.setActiveTab}
                    pageKey = ''
                    colors = {this.state.colors}
                    user = {USER}
                  />
                </Route>
                </Switch>
              ):(
                <Switch>
                <Route exact path="/" >
                  <MainPage 
                    setActiveTab = {this.setActiveTab}
                    colors = {this.state.colors}
                    pageKey = 'home'
                    socket = {socket}
                    user = {USER}
                  />
                </Route>
                <Route exact path="/changelog" >
                  <ChangelogPage
                    setActiveTab = {this.setActiveTab}
                    colors = {this.state.colors}
                    pageKey = 'changelog'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                </Route>
                <Route exact path="/blog" >
                  <BlogPage 
                    setActiveTab = {this.setActiveTab}
                    colors = {this.state.colors}
                    pageKey = 'blog'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                </Route>
                <Route exact path="/portfolio" >
                  <PortfolioPage 
                    setActiveTab = {this.setActiveTab}
                    colors = {this.state.colors}
                    pageKey = 'portfolio'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                </Route>
                <Route exact path="/goodies" >
                  <GoodiesPage 
                    setActiveTab = {this.setActiveTab}
                    colors = {this.state.colors}
                    pageKey = 'goodies'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                </Route>
                <Route path="/blog/new" 
                render={
                  (props) => <NewBlogPost {...props}
                  setActiveTab = {this.setActiveTab}
                  key={'newBlogPost'}
                  editing={false}
                    colors = {this.state.colors}
                    pageKey = 'blog'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/> 
                <Route path="/blog/edit/:id" 
                render={
                  (props) => <NewBlogPost {...props}
                  setActiveTab = {this.setActiveTab}
                  key={props.match.params.id}
                  editing={props.match.params.id}
                    colors = {this.state.colors}
                    pageKey = 'blog'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/> 
                <Route path="/portfolio/new" 
                render={
                  (props) => <NewPortfolioPost {...props}
                  setActiveTab = {this.setActiveTab}
                  key={'newPortfolioPost'}
                  editing={false}
                    colors = {this.state.colors}
                    pageKey = 'portfolio'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/> 
                <Route path="/portfolio/edit/:id" 
                render={
                  (props) => <NewPortfolioPost {...props}
                  setActiveTab = {this.setActiveTab}
                  key={props.match.params.id}
                  editing={props.match.params.id}
                    colors = {this.state.colors}
                    pageKey = 'portfolio'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/> 
                <Route path="/goodies/new" 
                render={
                  (props) => <NewGoodiesPost {...props}
                  setActiveTab = {this.setActiveTab}
                  key={'newGoodiesPost'}
                  editing={false}
                    colors = {this.state.colors}
                    pageKey = 'goodies'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/> 
                <Route path="/goodies/edit/:id" 
                render={
                  (props) => <NewGoodiesPost {...props}
                  setActiveTab = {this.setActiveTab}
                  key={props.match.params.id}
                  editing={props.match.params.id}
                    colors = {this.state.colors}
                    pageKey = 'goodies'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/> 
                <Route path="/blog/:id/:title" 
                render={
                  (props) => <BlogPost {...props}
                  setActiveTab = {this.setActiveTab}
                  key={props.match.params.id}
                    colors = {this.state.colors}
                    pageKey = 'blog'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/> 
                <Route path="/portfolio/:id/:title" 
                render={
                  (props) => <PortfolioPost {...props}
                  setActiveTab = {this.setActiveTab}
                  key={props.match.params.id}
                    colors = {this.state.colors}
                    pageKey = 'portfolio'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/> 
                <Route path="/goodies/:id/:title" 
                render={
                  (props) => <GoodiesPost {...props}
                  setActiveTab = {this.setActiveTab}
                  key={props.match.params.id}
                    colors = {this.state.colors}
                    pageKey = 'goodies'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/> 
                <Route exact path="/support/new/:goodieId" 
                render={
                  (props) => <NewBugReport {...props}
                  setActiveTab = {this.setActiveTab}
                  key={'NewBugReport'}
                  editing={false}
                    colors = {this.state.colors}
                    pageKey = 'goodies'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/>
                <Route path="/support/new" 
                render={
                  (props) => <NewBugReport {...props}
                  setActiveTab = {this.setActiveTab}
                  key={'NewBugReport'}
                  editing={false}
                    colors = {this.state.colors}
                    pageKey = 'goodies'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/>
                <Route exact path="/support/:id" 
                render={
                  (props) => <BugReport {...props}
                  setActiveTab = {this.setActiveTab}
                  key={`BugReport${props.match.params.id}`}
                    colors = {this.state.colors}
                    pageKey = 'goodies'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/>
                <Route exact path="/contact" 
                render={
                  (props) => <ContactPage {...props}
                  setActiveTab = {this.setActiveTab}
                  key={`ContactPage${USER._id}`}
                    colors = {this.state.colors}
                    pageKey = 'contactPage'
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/>
                <Route exact path="/contact/:id" 
                render={
                  (props) => <ContactMessage {...props}
                  setActiveTab = {this.setActiveTab}
                  key={`ContactMessage${props.match.params.id}`}
                    colors = {this.state.colors}
                    pageKey = 'contactPage'
                    socket = {socket}
                    user = {USER}
                    messageId = {props.match.params.id}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                }/>
                <Route path="/register" >
                  {
                    (USER.isLogged())?(
                      <Redirect to="/" />
                    ):(
                    <Register
                      setActiveTab = {this.setActiveTab}
                      pageKey = 'register'
                      colors = {this.state.colors}
                      socket = {socket}
                      addWarnMessage = {this.state.warnMessages.addMessage}
                      user = {USER}
                    />
                    )
                  }
                </Route>
                <Route exact path="/myprofile" >
                  {
                    (!USER.isLogged())?(
                      <Redirect to="/" />
                    ):(
                    <ProfilePage
                      setActiveTab = {this.setActiveTab}
                      pageKey = 'myprofile'
                      colors = {this.state.colors}
                      socket = {socket}
                      addWarnMessage = {this.state.warnMessages.addMessage}
                      user = {USER}
                    />
                    )
                  }
                </Route>
                <Route path="/myprofile/:section(overview|preferences|reports|password)"
                render = {
                  (props) => 
                    (!USER.isLogged())?(
                      <Redirect to="/" />
                    ):(
                    <ProfilePage
                      setActiveTab = {this.setActiveTab}
                      pageKey = 'myprofile'
                      colors = {this.state.colors}
                      socket = {socket}
                      section = {props.match.params.section}
                      addWarnMessage = {this.state.warnMessages.addMessage}
                      user = {USER}
                    />
                    )
                  
                }
                />

                <Route exact path="/admin"
                render = {
                  () => 
                    (!USER.isLogged())?(
                      <Redirect to="/" />
                    ):(
                    <AdminPage
                      setActiveTab = {this.setActiveTab}
                      pageKey = 'adminPage'
                      key = 'adminPage'
                      colors = {this.state.colors}
                      socket = {socket}
                      addWarnMessage = {this.state.warnMessages.addMessage}
                      user = {USER}
                    />
                    )
                  
                }
                />

                <Route path="/admin/:section(siteSettings|tabPages|navLinks|socialLinks|groups|users|whatsGood|reports|changelogs)"
                render = {
                  (props) => 
                    (!USER.isLogged())?(
                      <Redirect to="/" />
                    ):(
                    <AdminPage
                      setActiveTab = {this.setActiveTab}
                      pageKey = 'adminPage'
                      key = {`adminPage-${props.match.params.section}`}
                      colors = {this.state.colors}
                      socket = {socket}
                      section = {props.match.params.section}
                      addWarnMessage = {this.state.warnMessages.addMessage}
                      user = {USER}
                    />
                    )
                  
                }
                />
                  
                <Route path="/login" >
                {
                    (USER.isLogged())?(
                      <Redirect to="/" />
                    ):(
                    <Login
                      setActiveTab = {this.setActiveTab}
                      pageKey = 'login'
                      colors = {this.state.colors}
                      socket = {socket}
                      addWarnMessage = {this.state.warnMessages.addMessage}
                      user = {USER}
                    />
                    )
                  }
                </Route>
                <Route path="/policy">
                  <Terms
                    setActiveTab = {this.setActiveTab}
                    key = {`policy`}
                    type = "policy"
                    pageKey = 'policy'
                    colors = {this.state.colors}
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                </Route>
                <Route path="/terms">
                  <Terms
                    setActiveTab = {this.setActiveTab}
                    key = {`terms`}
                    type = "terms"
                    pageKey = 'terms'
                    colors = {this.state.colors}
                    socket = {socket}
                    user = {USER}
                    addWarnMessage = {this.state.warnMessages.addMessage}
                  />
                </Route>
                <Route>
                  <NotFound 
                    setActiveTab = {this.setActiveTab}
                    pageKey = ''
                    colors = {this.state.colors}
                    user = {USER}
                  />
                </Route>
              </Switch>
              )
            }
            
        </App>
        </>
      </Router>
    );
  }
}

render(<Body />, document.getElementById('app'));
