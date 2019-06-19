import React, { Component } from 'react';
import WarnMessage from './WarnMessage';
import ExpandedImage from './ExpandedImage';

class Overlay extends Component {

  constructor(props){
    super(props);

    this.state = {
        showImage : null
    }
  }

  updateShowImage = (showImage) => {
      this.setState({showImage});
  }

  componentDidMount(){
    
    let UpdateShowImage = this.updateShowImage;
    $(document).on("click", "img[data-expandimage]", function() {
        let imgSrc = $(this).attr("src");
        $("#app").css({overflow: "hidden"});
        UpdateShowImage(imgSrc);
    });

  }

  render(){
    const {showImage} = this.state;
    const {warnMessages} = this.props;
    let showImageComp = (<></>);
    if(showImage) {
        showImageComp = (
            <div className="darkOverlay">
                <ExpandedImage
                image={showImage}
                closeImage={() => {
                    $("#app").css({overflow: "auto"});
                    this.setState({showImage : null})
                }}
                />
            </div>
        );
    }
    return(
    <>
        {showImageComp}
        {
            (warnMessages.messages.length)?(
                <div className="ovWarnMsgsCont">
                    {warnMessages.messages.map( (msg, i) => {
                        return(
                        <WarnMessage
                            ok = {msg.ok}
                            index = {i}
                            removeMessage = {warnMessages.removeMessage}
                            key = {`${i}.${Math.random()}`}
                        >
                        {msg.message}
                        </WarnMessage>
                        );
                    })}
                </div>
            ):('')
        }
    </>
    );
  }
  
}

export default Overlay;
