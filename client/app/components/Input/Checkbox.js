import React, { Component } from 'react';

class Checkbox extends Component {

  constructor(props){
    super(props);
    
    this.state = {
        checkbox : {
            name : '',
            label : null,
            checked : false,
            error : false
        }
    };
  }

  componentDidMount(){
      let {checkbox} = this.props;
      if(checkbox.label){
          checkbox.label = [...checkbox.label];
      }
      this.setState({checkbox});
  }

  toggleCheckbox = () => {
    let {checkbox} = this.state;
    checkbox.checked = !checkbox.checked;
    this.setState({checkbox});
  }

  render() {
    const {checkbox} = this.state;
    const inputContClass = "inputCont" + ((checkbox.error)?" hasError":"");
    return (
        <div className={inputContClass} name={checkbox.name}>
            <div className="checkboxCont">
                <div className="checkbox" name={checkbox.name} data-checked={checkbox.checked} onClick={this.toggleCheckbox}/>
                {
                    (checkbox.label)?(
                        <div className="checkboxLabel">
                        {checkbox.label.map( (labelItem, i) => {
                            return(
                                <React.Fragment
                                key={i}
                                >
                                {labelItem}
                                </React.Fragment>
                            );
                            } )}
                        </div>
                    ):('')
                }
            </div>
            {
                (checkbox.error)?(
                    <div className="inputError">{checkbox.error}</div>
                ):('')
            }
        </div>
    );
  }
}

export default Checkbox;
