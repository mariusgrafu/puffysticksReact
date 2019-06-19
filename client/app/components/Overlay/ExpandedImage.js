import React, { Component } from 'react';
import onClickOutside from "react-onclickoutside";

class ExpandedImage extends Component {

    constructor(props){
        super(props);

    }

  
    handleClickOutside = evt => {
    const {closeImage} = this.props;
    if(closeImage != undefined){
        closeImage();
    }
    };

    render(){
        const {image} = this.props;
        return(
        <>
            <a href={image} target="_blank">
            <img className="expandedImage" src={image} />
            </a>
        </>
        );
    }
  
}

export default onClickOutside(ExpandedImage);
