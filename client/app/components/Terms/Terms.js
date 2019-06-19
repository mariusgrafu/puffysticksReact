import React from 'react';
import { Link } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import Func from '../Classes/Func';
import Editor from '../Helpers/Editor';

class Terms extends TabPage {
    constructor(props) {
        super(props);

        this.state = {
            terms : null,
            editing : false
        }
    }

    updateTerms = (terms) => {
        this.setState({terms});
    }

    refreshTerms = () => {
        const {type, socket} = this.props;
        let key = (type == 'policy')?("policy"):("terms");

        socket.emit(`client > server get Terms`, key, this.updateTerms);
    }

    componentDidMount() {
        const {type, socket} = this.props;
        let key = (type == 'policy')?("policy"):("terms");
        this.refreshTerms();

        socket.on(`server > client refresh Terms ${key}`, this.refreshTerms);
    }

    updateTermsAttr = (k, v) => {
        let {terms} = this.state;
        terms[k] = v;
        this.setState({terms});
    }

    saveEdit = () => {
        const {terms} = this.state;
        const {user, socket} = this.props;

        let data = {
            userData : user.getBasic(),
            terms
        }

        socket.emit(`client > server edit Terms`, data);
        this.setState({editing : false});

    }

  render(){
    const {user, socket} = this.props;
    const {terms, editing} = this.state;

    if(!terms) {
        return(<></>);
    }

    if(editing && user.isStaff()) {
        return (
            <div className="newPostCont">
                <div className="mainWrap">
                    <div className="npcTitle">editing terms</div>

                    <div className="npcInputWrapRow">
                    <div className="npcInputWrap">
                        <div className="npcInputLabel">title</div>
                        <div className="npcInputDesc">the title of these terms.</div>
                        <input type="text"
                        onChange={(e) => this.updateTermsAttr('title', e.target.value)}
                        value={terms.title}
                        placeholder={`privacy policy / terms of use`}
                        />
                    </div>
                    </div>

                    <div className="npcInputWrap">
                        <div className="npcInputLabel">content</div>
                        <div className="npcInputDesc">the actual terms.</div>
                        <Editor
                        user = {user}
                        socket = {socket}
                        text = {terms.content}
                        change = {(val) => this.updateTermsAttr('content', val)}
                        />
                    </div>

                    <div className="npcBtnsWrap">
                        <div className="btn primary" onClick={this.saveEdit}>save</div>
                        <div className="btn"
                        onClick={() => this.setState({editing: false}, this.refreshTerms)}
                        >cancel</div>
                    </div>
                </div>
            </div>
        );
    }

    let editBtn = (<></>);

    if(user.isStaff()) {
        editBtn = (<div className="btn primary" onClick={() => this.setState({editing : true})}>edit</div>);
    }

    return (
    <>
        <div className="termsPageWrap">
            <div className="mainWrap">
                <div className="tpTop">
                    <div className="tpTitleDate">
                        <div className="tpTitle">{terms.title}</div>
                        <div className="tpDate">last updated on {Func.fullDate(terms.lastUpdate)}</div>
                    </div>
                    {editBtn}
                </div>
                <div className="contentText" dangerouslySetInnerHTML={{__html : terms.content}} />
                
            </div>
        </div>
    </>
    );
  }
  
}

export default Terms;
