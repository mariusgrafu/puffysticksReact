import React, { Component } from 'react';

import Header from '../Header/Header';
import Footer from '../Footer/Footer';

class App extends Component {

  constructor(props){
    super(props);

  }

  componentDidMount() {
    const {user, socket} = this.props;

    if(user.isLogged() && socket) {
      socket.on(`server > client refresh user ${user.getBasic().userId}`, user.initData);
    }
  }


  render(){
    const {colors, socket} = this.props;
    return(
    <>
    <style>
      ::selection {`{
        color: ${colors._active.text}; 
        background: ${colors._active.accent};
      }`}
      a:hover {`{
        color: ${colors._active.accent};
      }`}
    </style>
      <Header 
        navLinks = {this.props.navLinks}
        colors = {this.props.colors}
        activeTab = {this.props.activeTab}
        user = {this.props.user}
        socket = {socket}
      />

      <main>
        {this.props.children}
      </main>

      <Footer 
        navLinks = {this.props.navLinks}
        socialLinks = {this.props.socialLinks}
        socket = {socket}
      />
    </>
    );
  }
  
}

export default App;
