import React, { Component } from 'react';
import Func from '../Classes/Func';

import Toggle from '../Helpers/Toggle';
import ImageUpload from '../Helpers/ImageUpload';

import {
    Link,
    Redirect
  } from 'react-router-dom';

class SiteSettings extends Component {

  constructor(props){
    super(props);

    this.state = {
        settings : {},
        ready : false,
        changesMade : false,
        showHelper : null
    }
  }

  updateSettings = (settings) => {
      this.setState({settings, ready : true, changesMade : false});
  }

  updateSettingsAttr = (k, v) => {
      let {settings} = this.state;
      settings[k] = v;
      this.setState({settings, changesMade : true});
  }

  refreshSettings = () => {
    const {socket} = this.props;

    socket.emit(`client > server get siteSettings`, this.updateSettings);
  }

  componentDidMount() {
      this.refreshSettings();
  }

  revertChanges = () => {
      this.refreshSettings();
      this.setState({changesMade : false});
  }

  addAvatar = (newAvt) => {
      let {settings} = this.state;
      settings.defaultAvatars.push(newAvt[0]);
      this.setState({settings, changesMade : true});
  }

  addCover = (newCover) => {
      let {settings} = this.state;
      settings.defaultCovers.push(newCover[0]);
      this.setState({settings, changesMade : true});
  }

  removeAvt = (index) => {
      let {settings} = this.state;
      if(settings.defaultAvatars.length <= 1) return;
      if(index < 0 || index >= settings.defaultAvatars.length) return;

      settings.defaultAvatars.splice(index, 1);
      this.setState({settings, changesMade : true});
  }

  removeCover = (index) => {
      let {settings} = this.state;
      if(settings.defaultCovers.length <= 1) return;
      if(index < 0 || index >= settings.defaultCovers.length) return;

      settings.defaultCovers.splice(index, 1);
      this.setState({settings, changesMade : true});
  }

  updateColor = (index, type, e) => {
      let {settings} = this.state;
      settings.colors[index].value[type] = e.target.value;
      this.setState({settings, changesMade : true});
  }

  submit = () => {
      const {settings} = this.state;
      const {user, socket} = this.props;

      let data = {
          userData : user.getBasic(),
          settings
      }

      socket.emit(`client > server edit siteSettings`, data, this.refreshSettings);
  }

  render() {
    const {socket, user} = this.props;
    const {ready, settings, changesMade, showHelper} = this.state;

    if(!ready) {
        return (<></>);
    }

    let revertBtn = (<></>);

    if(changesMade) {
        revertBtn = (
            <div className="btn" onClick={this.revertChanges}>revert changes</div>
        );
    }

    let defAvs = (<></>);

    if(settings.defaultAvatars && settings.defaultAvatars.length) {
        defAvs = (
            settings.defaultAvatars.map ( (av, i) => {
                return (
                    <div key={i} className="ssicColItem">
                    <img src={av} data-expandimage />
                    <i className="pufficon-close"
                    onClick={() => this.removeAvt(i)}
                    />
                    </div>
                );
            })
        );
    }

    let defCovers = (<></>);

    if(settings.defaultCovers && settings.defaultCovers.length) {
        defCovers = (
            settings.defaultCovers.map ( (cover, i) => {
                return (
                    <div key={i} className="ssicColItem">
                    <img src={cover} data-expandimage />
                    <i className="pufficon-close"
                    onClick={() => this.removeCover(i)}
                    />
                    </div>
                );
            })
        );
    }

    let newAvHelper = (<></>);

    if(showHelper == 'newAvt') {
        newAvHelper = (
            <ImageUpload
            user={user}
            socket={socket}
            uploadPath='/site'
            submitImage={this.addAvatar}
            cancelImage={() => this.setState({showHelper : false})}
            multipleImages={false}
            floating={true}
            />
        );
    }

    let newCoverHelper = (<></>);

    if(showHelper == 'newCover') {
        newCoverHelper = (
            <ImageUpload
            user={user}
            socket={socket}
            uploadPath='/site'
            submitImage={this.addCover}
            cancelImage={() => this.setState({showHelper : false})}
            multipleImages={false}
            floating={true}
            />
        );
    }

    let colorsComp = (<></>);

    if(settings.colors && settings.colors.length) {
        colorsComp = (
            <div className="siteSettingsColorsCont">
            {
                settings.colors.map( (color, i) => {
                    return (
                        <div key={i} className="siteSettingsColorWrap">
                        <div className="sscName">{color.key}</div>
                        <div className="sscCol">
                            <div className="sscCwrap">
                            <div className="sscClabel">accent color</div>

                            <div className="sscCColor">
                                <div className="sscCpreview" style={{backgroundColor : color.value.accent}} />
                                <input type="text" value={color.value.accent}
                                onChange = {(e) => this.updateColor(i, 'accent', e)}
                                />
                            </div>
                            
                            </div>
                            <div className="sscCwrap">
                            <div className="sscClabel">text color</div>

                            <div className="sscCColor">
                                <div className="sscCpreview" style={{backgroundColor : color.value.text}} />
                                <input type="text" value={color.value.text}
                                onChange = {(e) => this.updateColor(i, 'text', e)}
                                />
                            </div>
                            
                            </div>
                        </div>
                        </div>
                    );
                })
            }
            </div>
        );
    }

    return (
      <>
        <div className="newPostCont adminPageSiteSettingsCont">
        <div className="mainWrap">

        <div className="npcInputWrapRow">
            <div className="npcInputWrap">
            <div className="npcInputLabel">site online</div>
                <div className="npcInputDesc">go offline and only the really cool kids will see what's up.</div>
                <Toggle
                value = {settings.siteOnline}
                update = {(val) => this.updateSettingsAttr('siteOnline', val)}
                />
            </div>
        </div>

        <div className="npcInputWrapRow">
            <div className="npcInputWrap">
            <div className="npcInputLabel">default avatars</div>
                <div className="npcInputDesc">an array of curated avatars.</div>
                <div className="siteSettingsImageCollection">
                    <div className="ssicCollection">
                        {defAvs}
                    </div>
                    <div className="btn"
                    onClick = {() => this.setState({showHelper : 'newAvt'})}
                    >add an avatar</div>
                    <div className="ssicHelper">{newAvHelper}</div>
                </div>
            </div>
        </div>

        <div className="npcInputWrapRow">
            <div className="npcInputWrap">
            <div className="npcInputLabel">default covers</div>
                <div className="npcInputDesc">an array of curated covers.</div>
                <div className="siteSettingsImageCollection">
                    <div className="ssicCollection">
                        {defCovers}
                    </div>
                    <div className="btn"
                    onClick = {() => this.setState({showHelper : 'newCover'})}
                    >add a cover</div>
                    <div className="ssicHelper">{newCoverHelper}</div>
                </div>
            </div>
        </div>

        <div className="npcInputWrapRow">
            <div className="npcInputWrap">
            <div className="npcInputLabel">colors</div>
                <div className="npcInputDesc">colors from around the website.</div>
                {colorsComp}
            </div>
        </div>

        
        <div className="npcBtnsWrap">
            <div className="btn primary" onClick={this.submit}>submit</div>
            {revertBtn}
        </div>

        </div>
        </div>
      </>
    );
  }
}

export default SiteSettings;
