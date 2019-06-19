import React, { Component } from 'react';
import TabPage from '../TabPage/TabPage';
import Func from '../Classes/Func';
import { Link } from 'react-router-dom';

import ProfileOverview from './ProfileOverview';
import ProfilePreferences from './ProfilePreferences';
import ProfileReports from './ProfileReports';
import ProfilePassword from './ProfilePassword';

import ImagePicker from './ImagePicker';

class ProfilePage extends TabPage {

  constructor(props){
    super(props);

    this.state = {
        imagePicker : null
    }
  }

  render() {
    const {colors, user, socket, addWarnMessage} = this.props;
    let {section} = this.props;
    const {imagePicker} = this.state;

    section = section || 'overview';

    let sectionComp = (<></>);

    switch(section) {
        case 'overview': 
        sectionComp = (
            <ProfileOverview
            user = {user}
            socket = {socket}
            />
        );
        break;
        case 'preferences': 
        sectionComp = (
            <ProfilePreferences
            user = {user}
            socket = {socket}
            />
        );
        break;
        case 'reports': 
        sectionComp = (
            <ProfileReports
            user = {user}
            socket = {socket}
            />
        );
        break;
        case 'password': 
        sectionComp = (
            <ProfilePassword
            user = {user}
            socket = {socket}
            addWarnMessage = {addWarnMessage}
            />
        );
        break;
    }

    let imagePickerComp = (<></>);

    if(imagePicker) {
        imagePickerComp = (
            <ImagePicker
            submit = {((imagePicker == 'avatar')?(user.changeAvatar):(user.changeCover))}
            cancel = {() => this.setState({imagePicker : null})}
            user = {user}
            socket = {socket}
            type = {imagePicker}
            key = {imagePicker}
            />
        );
    }

    return (
      <>
        <div className="profilePageCont">
            <div className="profileCover" style={{backgroundImage: `url(${user.cover})`}}>
                <div className="mainWrap">
                    <div className="profileAvtName">
                        <div className="profileAvatar"
                        style={{backgroundImage: `url(${user.getAvatar()})`}}
                        title="change profile picture"
                        onClick = {() => this.setState({imagePicker : 'avatar'})}
                        >
                        <i className="pufficon-image" />
                        </div>
                        <div className="profileName">{user.displayName}</div>
                    </div>
                    <div className="profileToggleCoverChanger"
                    onClick = {() => this.setState({imagePicker : 'cover'})}
                    >change cover</div>
                    {imagePickerComp}
                </div>
            </div>

            <div className="profileSectionNav">
                <div className="mainWrap">
                    <Link to="/myprofile"
                    className={`profileSectionNavItem${(section == 'overview')?(' selected'):('')}`}
                    >overview</Link>
                    <Link to="/myprofile/preferences"
                    className={`profileSectionNavItem${(section == 'preferences')?(' selected'):('')}`}
                    >my preferences</Link>
                    <Link to="/myprofile/reports"
                    className={`profileSectionNavItem${(section == 'reports')?(' selected'):('')}`}
                    >my reports</Link>
                    <Link to="/myprofile/password"
                    className={`profileSectionNavItem${(section == 'password')?(' selected'):('')}`}
                    >change my password</Link>
                </div>
            </div>

            <div className="mainWrap profileSectionCont">
                {sectionComp}
            </div>
        </div>
      </>
    );
  }
}

export default ProfilePage;
