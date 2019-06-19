import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import UserDropdown from './UserDropdown';
import NotificationsPanel from './NotificationsPanel';

class UserBox extends Component{
    
  constructor(props){
    super(props);

    this.state = {
      showUserDropdown : false,
      showNotificationsPanel : false,
      notificationCount : 0
    };

  }

  updateNotificationCount = (notificationCount) => {
      this.setState({notificationCount});
  }

  refreshNotificationCount = () => {
    const {user, socket} = this.props;

    if(user.isLogged()) {
        let data = {
            userId : user._id
        }
        socket.emit(`client > server get userNotificationCount`, data, this.updateNotificationCount);
    }
  }

  componentDidMount () {
      const {user, socket} = this.props;

      this.refreshNotificationCount();

      if(user.isLogged() && socket) {
          socket.on(`server > client refresh userNotificationCount ${user._id}`, this.refreshNotificationCount);
      }
  }

  render(){
    const {user, colors, socket} = this.props;
    const {showUserDropdown, showNotificationsPanel, notificationCount} = this.state;

    let userDropdownComp = (<></>);

    if(showUserDropdown) {
        userDropdownComp = (
            <UserDropdown
            user = {user}
            closeDropdown = {() => this.setState({showUserDropdown : false})}
            />
        );
    }

    let userBox = (
        <i
        className="pufficon-guest guestIcon"
        onClick = {() => this.setState({showUserDropdown : true})}
        />
    );

    let notificationIcon = (<></>);
    let notificationPanelComp = (<></>);

    if(user.isLogged()) {
        let notificationCountComp = (<></>);
        if(notificationCount) {
            notificationCountComp = (
                <span
                className="notificationCount"
                style={
                    {
                        backgroundColor: colors._active.accent,
                        color: colors._active.text
                    }
                }
                >{notificationCount}</span>
            );
        }
        if (showNotificationsPanel) {
            notificationCountComp = (
                <NotificationsPanel
                    user = {user}
                    socket = {socket}
                    closePanel = {() => this.setState({showNotificationsPanel : false})}
                />
            );
        }
        notificationIcon = (
            <div className="notificationWrap noSelect">
                {notificationPanelComp}
                <div className="notificationIconWrap">
                    <i
                    className = "pufficon-notify notificationIcon"
                    onClick = {() => this.setState({showNotificationsPanel : true})}
                    />
                    {notificationCountComp}
                </div>
            </div>
        );
        userBox = (
            <div 
                className="headerUserboxAvatar"
                style = {{backgroundImage : `url(${user.getAvatar()})`}} 
                onClick = {() => this.setState({showUserDropdown : true})}
            />
        );
    }

    return (
    <>

    <div className="headerUserbox">
        {notificationIcon}
        {userBox}
        {userDropdownComp}
    </div>
    </>
    );
  }

}; 

export default UserBox;
