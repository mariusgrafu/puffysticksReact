import React, { Component } from 'react';


class ModalOverlay extends Component {

  constructor(props){
    super(props);
  }

  render(){
    return(
        <div className="modalOverlay">{this.props.children}</div>
    );
  }
};


export default ModalOverlay;