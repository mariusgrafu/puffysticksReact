import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import onClickOutside from "react-onclickoutside";

class UserDropdown extends Component{

    constructor(props){
        super(props);

    }

    handleClickOutside = evt => {
        // evt.preventDefault();
        const {closeDropdown} = this.props;
        if(closeDropdown != undefined){
            closeDropdown();
        }
    };

    render(){
        const {user} = this.props;

        if(!user.isLogged()) return(
            <div className="userDropdownCont">
                <div className="uddcUserDetails noSelect">
                    <div className="uddcudName">guest</div>
                    <i className="pufficon-guest guestIcon" />
                </div>
                <hr />
                <div className="uddcLinks">
                    <Link to="/login">login</Link>
                    <Link to="/register">register</Link>
                    {adminLink}
                </div>
            </div>
        );

        let adminLink = (<></>);

        if(user.isStaff()) {
            adminLink = (
                <Link to="/admin" target="_blank">admin page</Link>
            );
        }

        return (
            <div className="userDropdownCont">
                <div className="uddcUserDetails noSelect">
                    <div className="uddcudName">{user.displayName}</div>
                    <div className="headerUserboxAvatar" style={{backgroundImage: `url(${user.avatar})`}} />
                </div>
                <hr />
                <div className="uddcLinks">
                    <Link to="/myprofile">profile overview</Link>
                    <Link to="/myprofile/preferences">account preferences</Link>
                    <Link to="/myprofile/reports">my reports</Link>
                    {adminLink}
                </div>
                <hr />
                <div className="uddcLogout noSelect"
                onClick = {user.logout}
                >
                    <span>logout</span>
                    <i className="pufficon-logout" />
                </div>
            </div>
        );
    }

}; 

export default onClickOutside(UserDropdown);
