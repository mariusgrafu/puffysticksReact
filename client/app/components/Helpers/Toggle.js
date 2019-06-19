import React, { Component } from 'react';

class Toggle extends Component{

    constructor(props){
        super(props);

        
    }

    updateValue = () => {
        const {update} = this.props;
        let {value} = this.props;
        if(value == true) value = false;
        else value = true;
        update(value);
    }

    render(){
        const {title, value} = this.props;

        let titleComp = (<></>);
        if(title != undefined) {
            titleComp = (
                <div className="toggleCompTitle">{title}</div>
            );
        }

        return (
            <div className={`toggleCompCont noSelect${((value == true)?' tgld':'')}`}
            onClick={this.updateValue}
            >
                <div className="toggleCompSwitch" />
                {titleComp}
            </div>
        );
    }

}; 

export default Toggle;
