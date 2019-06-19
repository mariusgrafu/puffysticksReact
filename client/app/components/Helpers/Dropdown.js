import React, { Component } from 'react';
import onClickOutside from "react-onclickoutside";

class Dropdown extends Component{

    constructor(props){
        super(props);
        
        this.state = {
            dropped : false,
            options : []
        }
    }

    handleClickOutside = evt => {
        this.setState({dropped : false});
    };

    componentDidMount() {
        const {options} = this.props;
        this.setState({options});
    }

    getSelectedString = () => {
        const {options} = this.state;
        let ops = [];
        for(let i = 0; i < options.length; ++i) {
            if(options[i].selected == true) ops.push(options[i]);
        }
        return ops.map((elem) => {
            return elem.title;
        }).join(", ");
    }

    selectOption = (op) => {
        let {options} = this.state;
        let {multiple, neverEmpty, update} = this.props;
        let dropped = true;
        if(op < 0 || op >= options.length) return;
        if(multiple != true){
            for(let i = 0; i < options.length; ++i) {
                if(i == op) continue;
                options[i].selected = false;
            }
            dropped = false;
        }

        if(!options[op].selected){
            options[op].selected = true;
        }else{
            if(neverEmpty == true){
                if(options.filter((el) => (el.selected == true)).length > 1)
                    options[op].selected = false;
            }else{
                options[op].selected = false;
            }
        }
        if(update){
            update(options);
        }
        this.setState({options, dropped});
    }

    render(){
        const {dropped, options} = this.state;
        const {placeholder} = this.props;

        if(!options.length) return (<></>);

        let selectedString = this.getSelectedString() || placeholder || 'select an option';

        let optionsComps = [], optionsWrap = (<></>);
        if(dropped){

            for(let i = 0; i < options.length; ++i){
                optionsComps.push(
                    <div className={`ddOption ${((options[i].selected)?(' selected'):(''))}`}
                    key={`${i}${options[i].key}`}
                    onClick={() => this.selectOption(i)}
                    >
                    {(options[i].selected)?(
                        <i className="pufficon-checkmark" />
                    ):('')}
                    {options[i].title}
                    </div>
                );
            }

            optionsWrap = (
                <div className="ddOptionsWrap">
                    <div className="ddSelectedWrap" onClick={() => this.setState({dropped : false})}>
                        <div className="ddSelected">{selectedString}</div>
                        <i className="pufficon-pagearrow" />
                    </div>
                    {optionsComps}
                </div>
            );
        }
        

        return (
            <>
                <div className="dropdownWrap noSelect">
                    <div className="ddSelectedWrap" onClick={() => this.setState({dropped : true})}>
                        <div className="ddSelected">{selectedString}</div>
                        <i className="pufficon-pagearrow" />
                    </div>
                    {optionsWrap}
                </div>
            </>
        );
    }

}; 

export default onClickOutside(Dropdown);
