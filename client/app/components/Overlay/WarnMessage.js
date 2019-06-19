import React, { Component } from 'react';

class WarnMessage extends Component {

  constructor(props){
    super(props);

  }
  
  closeWarnMessage = () => {
      this.props.removeMessage(this.props.index);
  }

  componentDidMount = () => {
    setTimeout( () => {
        this.props.removeMessage(this.props.index);
    }, 5000);
  }

  render(){
    const {ok, index} = this.props;
    const cName = "warnMessageCont" + ((ok)?" notError":"");
    return(
        <div className={cName} >
            <div className="warnMessageTop">
                <div className="warnMessageTopTitle">alert</div>
                <div className="closeWarnMessage pufficon-close" onClick={this.closeWarnMessage}/>
            </div>
            <div className="warnMessageMsg">{this.props.children}</div>
        </div>
    );
  }
  
}

export default WarnMessage;
