import React, { Component } from 'react';
import ChangelogVersion from './ChangelogVersion';
import { inherits } from 'util';
import { Redirect } from 'react-router-dom';

class Changelog extends Component {

  constructor(props){
    super(props);

    this.state = {
        changelog : null,
        tglReorder : false,
        newVersion : null,
        redirect : false
    };
  }

  updateChangelog = (changelog) => {
      const {title} = this.props;
      if(title != undefined && title) changelog.title = title;
      this.setState({changelog});
  }

  componentDidMount() {
    const {socket, changelogId} = this.props;
    
    socket.emit(`client > server get changelog`, changelogId, this.updateChangelog);

    socket.on(`server > client refresh changelog ${changelogId}`, (newCh) => this.updateChangelog(newCh));

  }

  toggleReorder = () => {
      this.setState({tglReorder : true},
        () => {
            $(".changelogVersionsCont.chvcSort").sortable({
                axis : 'y'
            });
        }
    );
  }

  cancelReorder = () => {
      this.setState({tglReorder : false});
  }

  saveReorder = () => {
    const {user, socket} = this.props;
    if(!user.canThey('editChangelogs')) return;
    let {changelog} = this.state;
    let newVersions = [];
    $(".changelogVersionsCont .changelogVersion").each(function (i){
        let thisIndex = parseInt($(this).attr("data-index"));
        newVersions.push(changelog.versions[thisIndex]);
    });
    socket.emit(`client > server changelog editVersions`, user.getBasic(), changelog._id, newVersions);
    this.setState({tglReorder : false});
  }

  updateVersion = (vId, newV) => {
      let {changelog} = this.state;
      const {user, socket} = this.props;
      if(vId == -1){
        changelog.versions.unshift(newV);
      }else{
        changelog.versions[vId] = newV;
      }
      socket.emit(`client > server changelog editVersions`, user.getBasic(), changelog._id, changelog.versions);
  }

  initNewVersion = () => {
      this.setState({newVersion : {
          entries : []
      }});
  }

  removeVersion = (vId) => {
    if(vId == -1) return;
    const {socket, user} = this.props;
    let {changelog} = this.state;
    changelog.versions.splice(vId, 1);
    socket.emit(`client > server changelog editVersions`, user.getBasic(), changelog._id, changelog.versions);
  }

  deleteResponse = (res) => {
      if(res.success){
          const {goBack} = this.props;
          if(goBack) goBack();
          else {
              this.setState({redirect : true});
          }
      }
  }

  deleteChangelog = () => {
      const {socket, user} = this.props;
      let {changelog} = this.state;

      let data = {
          userData : user.getBasic(),
          id : changelog._id
      }
      socket.emit(`client > server delete Changelog`, data, this.deleteResponse)
  }

  render() {
    const {user, goBack, socket} = this.props;
    const {changelog, tglReorder, newVersion, redirect} = this.state;
    if(!changelog) return(<></>);
    if(redirect) return (<Redirect to="/" />);
    let chVerCont = (<></>);
    if(tglReorder){
        chVerCont = (
            <>
            <div className="changelogVersionsCont chvcSort">
            {
                (changelog.versions.length)?(
                    changelog.versions.map( (chVersion, i) => {
                        return(
                            <ChangelogVersion
                            user={user}
                            socket={socket}
                            item={chVersion}
                            reorderOn={tglReorder}
                            key={`${i}`}
                            itemKey={`${i}`}
                            />
                        );
                    })
                ):(
                    <div className="changelogNoEntries">there are no entries here</div>
                )
            }
            </div>
            <div className="changelogSettings">
                <div className="btn primary" onClick={this.saveReorder}>save reorder</div>
                <div className="btn" onClick={this.cancelReorder}>cancel reorder</div>
            </div>
            </>
        );
    }else{
        chVerCont = (
            <div className="changelogVersionsCont">
            <>
            {
                (newVersion)?(
                    <ChangelogVersion
                    user={user}
                    socket={socket}
                    item={newVersion}
                    reorderOn={tglReorder}
                    updateVersion={this.updateVersion}
                    key={-1}
                    itemKey={-1}
                    editing={true}
                    removeVersion={this.removeVersion}
                    cancelNewVersion={() => this.setState({newVersion : null})}
                    />
                ):('')
            }
            {
                (changelog.versions.length)?(
                    changelog.versions.map( (chVersion, i) => {
                        return(
                            <ChangelogVersion
                            user={user}
                            socket={socket}
                            item={chVersion}
                            reorderOn={tglReorder}
                            updateVersion={this.updateVersion}
                            removeVersion={this.removeVersion}
                            key={i}
                            itemKey={i}
                            />
                        );
                    })
                ):(
                    <div className="changelogNoEntries">there are no entries here</div>
                )
            }
            </>
            </div> 
        );
    }

    let topSettings = (<></>);
    if(goBack != undefined || user.canThey('editChangelogs')){
        let goBackBtn = (<></>), deleteBtn = (<></>);
        if(goBack != undefined){
            goBackBtn = (<div className="btn" onClick={goBack}>back</div>);
        }
        if(user.canThey('editChangelogs')){
            deleteBtn = (
                <div className="btn" onClick={this.deleteChangelog}>delete changelog</div>
            );
        }

        topSettings = (
            <div className="changelogTopSettings">
            {deleteBtn}
            {goBackBtn}
            </div>
        );
    }

    return (
      <>
        <div className="changelogCont" key={changelog._id}>
            <div className="mainWrap">
                <div className="changelogTop">
                    <div className="ctTitleCont">
                        <div className="ctTitle">{changelog.title}</div>
                        <div className="ctSubtitle">changelog</div>
                    </div>
                    {topSettings}
                </div>
                {
                    (user.canThey('editChangelogs') && !tglReorder && !newVersion)?(
                        <div className="changelogSettings">
                            <div className="btn primary" onClick={this.initNewVersion}>new version</div>
                            {
                                (changelog.versions.length > 1)?(
                                    <div className="btn" onClick={this.toggleReorder}>reorder versions</div>
                                ):('')
                            }
                        </div>
                    ):('')
                }
                {
                   chVerCont
                }
                
            </div>
        </div>
        
      </>
    );
  }
}

export default Changelog;
