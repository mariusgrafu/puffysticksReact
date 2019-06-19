import React, { Component } from 'react';
import onClickOutside from "react-onclickoutside";

class InsertCode extends Component{

    constructor(props){
        super(props);
    
        this.state = {
            code : ''
        };
    }

    doCancel = () => {
        const {cancel} = this.props;
        if(cancel != undefined) cancel();
    }

    doSubmit = () => {
        const {submit} = this.props;
        const {code} = this.state;
        if(submit != undefined) submit(code);
        this.doCancel();
    }

    handleClickOutside = evt => {
        evt.preventDefault();
        this.doCancel();
    };

    render(){
        const {code} = this.state;
        
        return (
            <>
            <div className="insertCodeHelperCont">
                <code>
                    <textarea value={code} onChange={(e) => this.setState({code : e.target.value})} />
                </code>

                <div className="insertCodeBtns">
                    <div className="btn primary"
                    onClick={this.doSubmit}
                    >submit</div>
                    <div className="btn"
                    onClick={this.doCancel}
                    >cancel</div>
                </div>
            </div>
            </>
        );
    }

}; 

export default onClickOutside(InsertCode);
