import React, { Component } from 'react';
import Func from '../Classes/Func';
import ChangelogEntry from './ChangelogEntry';

class ChangelogVersion extends Component {

  constructor(props){
    super(props);

    this.state = {
        expanded : '',
        isEditing : false,
        editedItem : {
            date : Func.formatDatePostPage(Date.now()),
            entries : []
        },
        newEntry : null,

        reorderEntries : false,
        entriesCpy : []

    };
  }

  toggleExpand = () => {
    const {expanded} = this.state;
    if(expanded == '')
        this.setState({expanded : ' collapsed'});
    else
        this.setState({expanded : ''});
  }

  editingOn = () => {
    const {item} = this.props;
    let editedItem = $.extend(true, {}, item);
    editedItem.date = Func.formatDatePostPage(editedItem.date);
    this.setState({isEditing: true, editedItem});
  }

  onChangeDate = (e) => {
      let {editedItem} = this.state;
      editedItem.date = e.target.value;
      this.setState({editedItem});
  }

  onChangeTitle = (e) => {
      let {editedItem} = this.state;
      editedItem.title = e.target.value;
      this.setState({editedItem});
  }

  saveEdit = () => {
    const {updateVersion, itemKey, cancelNewVersion} = this.props;
    let {editedItem} = this.state;
    editedItem.date = new Date(editedItem.date);
    updateVersion(itemKey, editedItem);
    if(itemKey == -1) cancelNewVersion();
    this.setState({isEditing: false});
  }

  cancelEdit = () => {
    const {itemKey, cancelNewVersion} = this.props;
    if(itemKey == -1) cancelNewVersion();
    this.setState({isEditing: false})
  }

  initNewEntry = () => {
      this.setState({newEntry : {}});
  }

  cancelNewEntry = () => {
      this.setState({newEntry : null});
  }

  updateEntries = (eId, newE) => {
    let {editedItem} = this.state;
    if(!editedItem.entries || !editedItem.entries.length){
    editedItem.entries.push(newE);
    }
    else{
        if(eId == -1){
            editedItem.entries.unshift(newE);
        }else{
            editedItem.entries[eId] = newE;
        }
    }
      this.setState({editedItem});
  }

  removeEntry = (eId) => {
      if(eId == -1) return;
      let {editedItem} = this.state;
      editedItem.entries.splice(eId, 1);
      this.setState({editedItem});
  }

  deleteVersion = () => {
    const {removeVersion, itemKey} = this.props;
    if(itemKey == -1) return;
    removeVersion(itemKey);
    this.setState({isEditing : false});
  }

  
  modItemDate = () => {
    let {editedItem} = this.state;
    editedItem.date = Func.formatDatePostPage(editedItem.date);
    if(editedItem.date == 'Invalid Date') editedItem.date = '';
    this.setState({editedItem});
  }

  render() {
    const {user, socket, item, itemKey, reorderOn, editing} = this.props;
    const {expanded, editedItem, newEntry, reorderEntries, entriesCpy} = this.state;
    let {isEditing} = this.state;
    if(!item) {
        this.deleteVersion();
        return (<></>);
    }
    if(editing) {
        isEditing = true;
    }

    let changelogSettings = (<></>);

    if (isEditing) {
        let changelogSettingsArr = [];

        if (!reorderEntries) {
            changelogSettingsArr.push(
                <div className="btn primary" key="saveChangesBtn" onClick={this.saveEdit}>save changes</div>
            );
            if(itemKey != -1) {
                changelogSettingsArr.push(
                    <div className="btn primary" key="deleteVersionBtn" onClick={this.deleteVersion}>delete version</div>
                );
            }
            changelogSettingsArr.push(
                <div className="btn" key="cancelBtn" onClick={this.cancelEdit}>cancel</div>
            );
            if (!newEntry) {
                changelogSettingsArr.push(
                    <div className="btn" key="addNewEntryBtn" onClick={this.initNewEntry} >add new entry</div>
                );
            }
        
        if(editedItem.entries.length > 1 && 0) {
            changelogSettingsArr.push(
                <div className="btn" key="reorderEntriesBtn" onClick={this.reorderEntries}>reorder entries</div>
            );
        }
        }else {
            changelogSettingsArr.push(
                <div className="btn primary" key="reorderEntriesSaveBtn" onClick={this.reorderEntriesSave}>save reorder</div>
            );
            changelogSettingsArr.push(
                <div className="btn" key="reorderEntriesCancelBtn" onClick={this.reorderEntriesCancel}>cancel reorder</div>
            );
        }
        

        changelogSettings = (
            <div className="changelogSettings">{changelogSettingsArr}</div>
        );

    }

    return (
      <>
        <div className={`changelogVersion${expanded}${((isEditing)?' editing':'')}`} data-index={itemKey}>
            <div className="chvTop">
                {
                    (item.entries && item.entries.length && !isEditing)?(
                        <i className="chvToggler pufficon-pagearrow" onClick={this.toggleExpand} />
                    ):('')
                }
                <div className="chvTitle">
                {
                    (isEditing)?(
                        <input type="text" value={editedItem.title}
                        placeholder="version title here"
                        onChange = {(e) => this.onChangeTitle(e)} />
                    ):(
                        <>{item.title}</>
                    )
                }
                </div>
                <div className="chvDate">
                {
                    (isEditing)?(
                        <input type="text" value={editedItem.date}
                        placeholder="version date here"
                        onBlur = {this.modItemDate}
                        onChange = {(e) => this.onChangeDate(e)}
                        />
                    ):(
                        <>{Func.formatDatePostPage(item.date)}</>
                    )
                }
                </div>
                {
                    (user.canThey(`editChangelogs`) && !isEditing && !reorderOn)?(
                        <div className="chvtSetting" onClick={this.editingOn}>edit</div>
                    ):('')
                }
            </div>
            {changelogSettings}
            {
                    ((item.entries && item.entries.length || newEntry != null) && !reorderOn || isEditing)?(
                        <>
                        <div className="chvEntriesCont">
                        {
                            (newEntry != null)?(
                                <ChangelogEntry
                                user={user}
                                socket={socket}
                                entry={newEntry}
                                entryKey={-1}
                                editing={true}
                                saveEntry={this.updateEntries}
                                parentEditing={isEditing}
                                cancelNewEntry={this.cancelNewEntry}
                                key={`${-1}`}
                                />
                            ):('')
                        }
                        {
                            (isEditing)?(
                                (editedItem.entries && editedItem.entries.length)?(
                                    editedItem.entries.map( (entry, i) => {
                                        return (
                                            <ChangelogEntry
                                            user={user}
                                            socket={socket}
                                            entry={entry}
                                            entryKey={i}
                                            parentEditing={isEditing}
                                            saveEntry={this.updateEntries}
                                            removeEntry={this.removeEntry}
                                            key={`${i}`}
                                            />
                                        );
                                    })
                                ):('')
                            ):(
                                (item.entries.length)?(
                                    item.entries.map( (entry, i) => {
                                        return (
                                            <ChangelogEntry
                                            user={user}
                                            socket={socket}
                                            entry={entry}
                                            entryKey={i}
                                            saveEntry={this.updateEntries}
                                            removeEntry={this.removeEntry}
                                            key={`${i}`}
                                            />
                                        );
                                    })
                                ):('')
                            )
                        }
                        </div>
                        </>
                    ):('')
                }
        </div>
      </>
    );
  }
}

export default ChangelogVersion;
