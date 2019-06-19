import React, { Component } from 'react';

class OrderInput extends Component {

  constructor(props){
    super(props);
    
    this.state = {
        order : {
            name : '',
            label : null,
            direction : 'desc',
            error : false
        }
    };
  }

  componentDidMount(){
      let {order} = this.props;
      if(order.label){
          order.label = [...order.label];
      }
      this.setState({order});
  }

  switchDirection = () => {
    let {order} = this.state;
    order.direction = (order.direction == 'desc')?'asc':'desc';
    this.setState({order});
  }

  render() {
    const {order} = this.state;
    const inputContClass = "inputCont" + ((order.error)?" hasError":"");
    return (
        <div className={inputContClass} name={order.name}>
            <div className="orderInputCont">
                <div className="orderInput" name={order.name} data-direction={order.direction} onClick={this.switchDirection}/>
                {
                    (order.label)?(
                        <div className="orderInputLabel">
                        {order.label.map( (labelItem, i) => {
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
                (order.error)?(
                    <div className="inputError">{order.error}</div>
                ):('')
            }
        </div>
    );
  }
}

export default OrderInput;
