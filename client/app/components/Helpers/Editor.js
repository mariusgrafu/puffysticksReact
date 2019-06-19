import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable';
import Emojis from './Emojis';
import ImageUpload from './ImageUpload';
import InsertCode from './InsertCode';

class Editor extends Component{

    constructor(props){
        super(props);
        let editorId = `ed${Date.now()}${Math.random()}`
        this.state = {
            text : '',
            caretPos : 0,
            showHelper : null,
            editorId,
            toEdit : document.getElementById(editorId)
        }
        
    }

    triggerChange = e => {
        const {change} = this.props;
        if(change != undefined) change(e.target.value);
        this.moveTarget(e.target);
    }

    doUpdate = () => {
        const {editorId} = this.state;
        const {change} = this.props;
        if(change != undefined) {
            change(document.getElementById(editorId).innerHTML);
        }
    }

    insertInText = (text, val) => {
        let {caretPos} = this.state;
        text = text.slice(0, caretPos) + val + text.slice(caretPos);
        caretPos += val.length;
        this.setState({caretPos});
        return text;
    }

    setHelper = (e, helper) => {
        e.preventDefault();
        let {showHelper} = this.state;
        if(helper == showHelper) showHelper = null;
        else showHelper = helper;
        this.setState({showHelper});
    }

    componentDidMount() {
        const {text} = this.props;
        this.setState({text});
    }

    insertEmoji = (em) => {
        let {toEdit, editorId} = this.state;
        if(!toEdit) toEdit = document.getElementById(editorId);
        $(toEdit).html(this.insertInText(toEdit.innerHTML, em));
        this.doUpdate();
    }

    insertCodeSubmit = (code) => {
        let {toEdit, editorId} = this.state;
        if(!toEdit) toEdit = document.getElementById(editorId);
        $(toEdit).html(this.insertInText(toEdit.innerHTML, code));
        this.doUpdate();
    }

    insertImage = (img) => {
        let {toEdit, editorId} = this.state;
        if(!toEdit) toEdit = document.getElementById(editorId);
        $(toEdit).html(this.insertInText(toEdit.innerHTML, `<img src='${img}' />`));
        this.doUpdate();
    }

    moveTarget = (e) => {
        let {toEdit} = this.state;
        toEdit = e.target;
        let caretPos = window.getSelection().focusOffset;
        this.setState({toEdit, caretPos});
    }

    render(){
        const {user, socket} = this.props;
        const {text, showHelper, editorId} = this.state;

        let helperComp = (<></>);
        switch(showHelper){
            case 'emoji':
            helperComp = (
                <Emojis
                closeWrap={() => this.setState({showHelper : null})}
                submit={this.insertEmoji}
                onClick={(e) => e.preventDefault()}
                />
            );
            break;
            case 'image':
            helperComp = (
                <ImageUpload
                user={user}
                socket={socket}
                uploadPath='/posts'
                submitImage={this.insertImage}
                cancelImage={() => this.setState({showHelper : null})}
                multipleImages={false}
                floating={true}
                onClick={(e) => e.preventDefault()}
                />
            );
            break;
            case 'code':
            helperComp = (
                <InsertCode
                submit={this.insertCodeSubmit}
                cancel={() => this.setState({showHelper : null})}
                />
            );
            break;
        }

        let insertCodeIcon = (<></>);

        if(user.isStaff()) {
            insertCodeIcon = (
                <i className={`pufficon-code${((showHelper == 'code')?' active':'')}`}
                onClick={(e) => this.setHelper(e, 'code')}
                data-tooltip="insert code"
                />
            );
        }

        return (
            <>
            <div className="editorCont">
            <div className="editorHelpersCont noSelect">
                <div className="editorHelpersIcons">

                    <i className="pufficon-bold"
                    data-tooltip="bold"
                    onClick={e => {e.preventDefault(); document.execCommand('bold', false);}}
                    />

                    <i className="pufficon-italic"
                    data-tooltip="italic"
                    onClick={e => {e.preventDefault(); document.execCommand('italic', false);}}
                    />

                    <i className="pufficon-justifyleft"
                    data-tooltip="align left"
                    onClick={e => {e.preventDefault(); document.execCommand('justifyLeft', false);}}
                    />

                    <i className="pufficon-justifycenter"
                    data-tooltip="align center"
                    onClick={e => {e.preventDefault(); document.execCommand('justifyCenter', false);}}
                    />

                    <i className="pufficon-justifyright"
                    data-tooltip="align right"
                    onClick={e => {e.preventDefault(); document.execCommand('justifyRight', false);}}
                    />

                    <i className={`pufficon-emoji${((showHelper == 'emoji')?' active':'')}`}
                    onClick={(e) => this.setHelper(e, 'emoji')}
                    data-tooltip="insert emoji"
                    />

                    <i className={`pufficon-image${((showHelper == 'image')?' active':'')}`}
                    onClick={(e) => this.setHelper(e, 'image')}
                    data-tooltip="insert image"
                    />

                    {insertCodeIcon}

                </div>
                <div className="editorHelpersSpawn">{helperComp}</div>
            </div>
            <ContentEditable
            className="contentText"
            onChange = {this.triggerChange}
            id = {editorId}
            onClick={this.moveTarget}
            html = {text || ''}
            />
            </div>
            </>
        );
    }

}; 

export default Editor;
