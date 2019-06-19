import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import ModalOverlay from './ModalOverlay';


class ModalConfirmComp extends Component {

  constructor(props){
    super(props);
  }

  doAction = (action) => {
    const {wrapper} = this.props;
    if(action) action();
    ReactDOM.unmountComponentAtNode(wrapper);
    $(wrapper).remove();
  }

  render(){
    let {message, confirmText, cancelText, confirmAction, cancelAction} = this.props;
    if(!confirmText) confirmText = 'confirm';
    if(!cancelText) cancelText = 'cancel';
    return(
        <>
        <div className="confirmModalWrap">
            <div className="confirmModalMessage">{message}</div>
            
            <div className="confirmModalBtns">
            <div className="btn primary" onClick={() => this.doAction(confirmAction)}>{confirmText}</div>
            <div className="btn" onClick={() => this.doAction(cancelAction)}>{cancelText}</div>
            </div>
            
        </div>
        </>
    );
  }
};

function ModalConfirm(message, options){

    let wrapper = document.body.appendChild(document.createElement('div'));
    ReactDOM.render(
    <ModalOverlay>
    <ModalConfirmComp wrapper={wrapper} confirmAction={() => null} cancelAction={() => null} message={message} {...options}/>
    </ModalOverlay>
    , wrapper);

};

export default ModalConfirm;