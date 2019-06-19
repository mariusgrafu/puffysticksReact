import React, { Component } from 'react';
import ImageUpload from '../Helpers/ImageUpload';
import Emojis from '../Helpers/Emojis';
import ContentEditable from 'react-contenteditable';
import sanitizeHtml from 'sanitize-html';
import Editor from '../Helpers/Editor';

class ChangelogEntry extends Component {

  constructor(props){
    super(props);

    this.state = {
      isEditing : false,
      editedEntry : {...props.entry},
      showHelper : null
    }
  }

  toggleEType = (eType) => {
    let {editedEntry} = this.state;
    if(eType == editedEntry.type) editedEntry.type = undefined;
    else editedEntry.type = eType;
    this.setState({editedEntry});
  }

  cancelEdit = () => {
    const {cancelNewEntry, entryKey, editing} = this.props;
    if(editing || entryKey == -1){
      cancelNewEntry();
    }
    this.setState({isEditing : false});
  }

  saveEdit = () => {
    const {entryKey, saveEntry} = this.props;
    const {editedEntry} = this.state;
    saveEntry(entryKey, editedEntry);
    this.cancelEdit();
  }

  onChangeText = (val) => {
    let {editedEntry} = this.state;
    editedEntry.text = val;
    
    this.setState({editedEntry});
  }

  startEditing = () => {
    let editedEntry = {...this.props.entry};
    this.setState({editedEntry, isEditing : true});
  }

  deleteEntry = () => {
    const {removeEntry, entryKey} = this.props;
    if(entryKey == -1) return;
    removeEntry(entryKey);
    this.cancelEdit();
  }

  toggleHelper = (helper) => {
    let {showHelper} = this.state;
    if(showHelper == helper) showHelper = null;
    else showHelper = helper;
    this.setState({showHelper});
  }

  insertImage = (imgs) => {
    let {editedEntry} = this.state;
    if(editedEntry.text == undefined) editedEntry.text = '';
    for(let i = 0; i < imgs.length; ++i){
      editedEntry.text += `<img src="${imgs[i]}" />`;
    }
    this.setState({editedEntry});
  }

  insertEmoji = (em) => {
    let {editedEntry} = this.state;
    if(editedEntry.text == undefined) editedEntry.text = '';
    editedEntry.text += em;
    this.setState({editedEntry});
  }

  render() {
    const {user, socket, entry, entryKey, editing, parentEditing} = this.props;
    let {isEditing, editedEntry, showHelper} = this.state;
    if(editing) isEditing = true;
    if(!parentEditing) isEditing = false;
    let entryType = null;
    entry.text = sanitizeHtml(entry.text, {
      allowedTags: false,
      allowedAttributes: false,
      transformTags: {
        'img': (tagName, attribs) => {
            // My own custom magic goes here
            let newAttribs = {...attribs};
            newAttribs['data-expandimage'] = true;
            return {
                tagName,
                attribs: newAttribs
            };
        }
      }
    });
    switch(entry.type){
        case 'new':
        entryType = 'new';
        break;
        case 'fix':
        entryType = 'fix';
        break;
        case 'change':
        entryType = 'change';
        break;
    }
    let entryTypes = ['new', 'fix', 'change'];
    let helperComp = (<></>);
    switch(showHelper) {
      case 'image' :
      helperComp = (
        <ImageUpload
        user={user}
        socket={socket}
        uploadPath='/posts'
        submitImage={this.insertImage}
        cancelImage={() => this.setState({showHelper : null})}
        multipleImages={false}
        floating={true}
        />
      );
      break;
      case 'emoji':
      helperComp = (
        <Emojis
        closeWrap={() => this.setState({showHelper : null})}
        submit={this.insertEmoji}
        />
      );
      break;
    }
    return (
      <>
      {
        (isEditing)?(
          <div className="chvEntry">

          <div className="chveEdTypes">
          {
              entryTypes.map( (eType) => {
                return(
                  <div className={`chveType noSelect${((eType == editedEntry.type)?' selected':'')}`}
                  key={eType}
                  onClick={() => this.toggleEType(eType)}
                  >{eType}</div>
                );
              })
          }
          </div>
          {/* <div className="chEntryHelpersCont">
            <div className="chEntryHelpersTop">
              <i className={`pufficon-emoji${((showHelper == 'emoji')?' tgld':'')}`}
              data-tooltip="insert emoji"
              onClick={() => this.toggleHelper('emoji')}
              />
              <i className={`pufficon-image${((showHelper == 'image')?' tgld':'')}`}
              data-tooltip="insert image"
              onClick={() => this.toggleHelper('image')}
              />
            </div>
            <div className="chEntryHelperWrap">{helperComp}</div>
          </div> */}
          <Editor
            user = {user}
            socket = {socket}
            text = {editedEntry.text}
            change = {this.onChangeText} 
          />
          {/* <ContentEditable className="chveText" onChange={this.onChangeText} html={editedEntry.text} /> */}
          <div className="changelogSettings">
            <div className="btn primary" onClick={this.saveEdit}>save entry</div>
            {
              (entryKey != -1)?(
                <div className="btn primary" onClick={this.deleteEntry}>delete entry</div>
              ):('')
            }
            <div className="btn" onClick={this.cancelEdit} >cancel</div>
          </div>
          </div>
        ):(
          <div className="chvEntry" data-index={entryKey}>
          {
            (user.canThey('editChangelogs') && parentEditing || entryType)?(
              <div className="chveTEWrap">
              {
                  (entryType)?(
                      <div className="chveType noSelect">{entryType}</div>
                  ):('')
              }
              {
                (user.canThey('editChangelogs') && parentEditing)?(
                  <div className="chveEditBtn" onClick={this.startEditing}>edit</div>
                ):('')
              }
              </div>
            ):('')
          }
          <div className="contentText chveText" dangerouslySetInnerHTML={{__html: entry.text}}/>
          </div>
        )
      }
        
      </>
    );
  }
}

export default ChangelogEntry;
