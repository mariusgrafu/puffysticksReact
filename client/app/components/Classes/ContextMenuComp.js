import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import onClickOutside from "react-onclickoutside";

class ContextMenuComp extends Component {

  constructor(props){
    super(props);
  }

  doAction = (action) => {
    const {wrapper} = this.props;
    if(action) action();
    ReactDOM.unmountComponentAtNode(wrapper);
    $(wrapper).remove();
  }

  handleClickOutside = evt => {
      const {wrapper} = this.props;
      $(wrapper).remove();
  }

  render(){
    let {options, event} = this.props;
    if(!options.length) return;
    let top = 0, left = 0;
    top = event.clientY - 10;
    left = event.clientX + 10;

    top = Math.min(top, (window.innerHeight - 205));
    top = Math.max(top, 0);

    left = Math.min(left, (window.innerWidth - 205));
    left = Math.max(left, 0);
    
    return(
        <>
            <div className="contextMenuWrap" style={{top : `${top}px`, left : `${left}px`}}>
                {
                    options.map( (option, i) => {
                        return(
                            <div
                            className="contextMenuOption"
                            key={i}
                            onClick={() => this.doAction(option[1])}
                            >
                            {option[0]}
                            </div>
                        );
                    })
                }
            </div>
        </>
    );
  }
};


export default onClickOutside(ContextMenuComp);