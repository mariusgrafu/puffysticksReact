import React, { Component } from 'react';

class Input extends Component {

  constructor(props){
    super(props);
    
    this.state = {
        input: {
            name : '',
            label : '',
            type : 'text',
            placeholder : '',
            info : null,
            error : null,
            onChange : null
        },
        attr : null,
        infoCont : null
    }
  }

  onChange = () => {
    
  }

  toggleInfo = () => {
      const {input} = this.state;
      if(!input.info) throw 0;
      let {infoCont} = this.state;
      if(!infoCont){
          infoCont = input.info.content;
      }else{
          infoCont = null;
      }
      this.setState({infoCont});
  }

  componentWillMount(){
    let {input} = this.props;
    let attr = {};
    let infoCont = null;
    if(!input.type) input.type = 'text';
    if(!input.onChange) input.onChange = this.onChange;
    if(!input.name) input.name = ' ';
    attr.name = input.name;
    attr.type = input.type;
    if(input.placeholder) attr.placeholder = input.placeholder;
    attr.onChange = this.onChange;
    if(input.info){
        if(!input.info.icon) infoCont = input.info.content;
        if(!input.info.content) {
            infoCont = null;
            input.info = null;
        }
    }
    this.setState({input, attr, infoCont});
  }

  render() {
    const {input} = this.state;
    const {attr} = this.state;
    const {infoCont} = this.state;
    const inputContClass = "inputCont" + ((input.error)?" hasError":"");
    return (
      <div className={inputContClass} name={input.name}>
        <div className="inputTop">
            <div className="inputLabel">{input.label}</div>
            {
                (input.info)?(
                    (input.info.icon)?(
                        <div className="inputInfoIcon" onClick={this.toggleInfo}>
                            <div className="inputInfoIconQ" />
                        </div>
                    ):('')
                ):('')
            }
        </div>
        {
            (infoCont)?(
                <div className="inputInfoCont">{infoCont}</div>
            ):('')
        }
        <input
        {...attr}
         />
         {
             (input.error)?(
                 <div className="inputError">{input.error}</div>
             ):('')
         }
      </div>
    );
  }
}

export default Input;
