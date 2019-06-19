import React, { Component } from 'react';

class SignupHeader extends Component {

  constructor(props){
    super(props);
  }

  render() {

    return (
      <div className="signupHeader">
        <div className="shTitle">{this.props.title}<span className="shDot" /></div>
        <div className="shSubtitle">{this.props.subtitle}</div>
      </div>
    );
  }
}

export default SignupHeader;
