import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import onClickOutside from "react-onclickoutside";
import Func from '../Classes/Func';

class NotificationsPanel extends Component{

    constructor(props){
        super(props);

        this.state = {
            notifications : []
        }
    }

    handleClickOutside = evt => {
        evt.preventDefault();
        const {closePanel} = this.props;
        if(closePanel != undefined){
            closePanel();
        }
    };

    updateNotifications = (notifications) => {
        this.setState({notifications});
    }

    refreshNotifications = () => {
        const {user, socket} = this.props;

        let data = {
            userId : user._id
        }

        socket.emit(`client > server get userNotifications`, data, this.updateNotifications);
    }

    componentDidMount () {
        const {user, socket} = this.props;

        this.refreshNotifications();

        socket.on(`server > client refresh notifications ${user._id}`, this.refreshNotifications);
    }

    deleteNotification = (notifId) => {
        const {user, socket} = this.props;
        let data = {
            notificationId : notifId,
            userId : user._id
        }
        socket.emit(`client > server delete notification`, data);
    }

    render(){
        const {user} = this.props;
        const {notifications} = this.state;

        if(!user.isLogged()) return(<></>);

        let notificationsPanelContentComp = (<span className="noNotifications">There are no notifications</span>);

        if (notifications.length) {
            notificationsPanelContentComp = [];
            notifications.map( (notification, i) => {
                let notificationItemContent = (<></>);
                switch(notification.type) {
                    case 'newBlogPost':
                    case 'newPortfolioPost':
                    case 'newGoodiesPost':
                    notificationItemContent = (
                        <>
                        <span className="notifMsg">there's a new {notification.content.pageKey} article</span>
                        <Link className="notifPostTitle"
                        to = {`/${notification.content.pageKey}/${notification.content.id}/${Func.speakingUrl(notification.content.title)}`}
                        >{notification.content.title}</Link>
                        </>
                    );
                    break;
                    case 'newComment':
                    notificationItemContent = (
                        <>
                        <span className="notifMsg">there's a new comment in a {notification.content.pageKey} article</span>
                        <Link className="notifPostTitle"
                        to = {`/${notification.content.pageKey}/${notification.content.id}/a`}
                        >go to page</Link>
                        </>
                    );
                    break;
                    case 'newReport':
                    notificationItemContent = (
                        <>
                        <span className="notifMsg">there's a new bug report</span>
                        <Link className="notifPostTitle"
                        to = {`/${notification.content.pageKey}/${notification.content.id}/`}
                        >{notification.content.title}</Link>
                        </>
                    );
                    break;
                    case 'newContactMessage':
                    notificationItemContent = (
                        <>
                        <span className="notifMsg">there's a new contact message</span>
                        <Link className="notifPostTitle"
                        to = {`/${notification.content.pageKey}/${notification.content.id}/`}
                        >{notification.content.title}</Link>
                        </>
                    );
                    break;
                    case 'contactStatusChange':
                    notificationItemContent = (
                        <>
                        <span className="notifMsg">state changed to <b>{notification.content.newState}</b> on your contact message</span>
                        <Link className="notifPostTitle"
                        to = {`/${notification.content.pageKey}/${notification.content.id}/`}
                        >{notification.content.title}</Link>
                        </>
                    );
                    break;
                    case 'newContactReply_staff':
                    case 'newContactReply':
                    notificationItemContent = (
                        <>
                        <span className="notifMsg">there's a new reply in a contact message</span>
                        <Link className="notifPostTitle"
                        to = {`/${notification.content.pageKey}/${notification.content.id}/`}
                        >{notification.content.title}</Link>
                        </>
                    );
                    break;
                }
                notificationsPanelContentComp.push(
                    <div key={i}
                    className="notificationItem">
                    <div className="notificationTop">
                        <div className="notificationDate">{Func.formatDateAgo(notification.postDate)}</div>
                        <i className="pufficon-close notificationClose" onClick={() => this.deleteNotification(notification._id)} />
                    </div>
                    {notificationItemContent}
                    </div>
                );
            } );
        }

        return (
            <div className="notificationsPanelWrap">
                <div className="notificationsPanelTop">
                    Notifications
                </div>
                <div className="notificationsPanelContent">
                {notificationsPanelContentComp}
                </div>
            </div>
        );
    }

}; 

export default onClickOutside(NotificationsPanel);
