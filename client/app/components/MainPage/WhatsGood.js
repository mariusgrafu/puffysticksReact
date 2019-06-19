import React, { Component } from 'react';
import WhatsGoodItem from './WhatsGoodItem';

class WhatsGood extends Component {

    constructor(props){
        super(props);

        this.state = {
            items:
            [
                // {
                //     key : 'port',
                //     post : null,
                //     title : '',
                //     description : '',
                //     button : {
                //         title : '',
                //         to : ''
                //     }
                // }
            ]
        };
    }

    updateItems = (items) => {
        this.setState({items});
    }

    componentWillMount(){
        const {socket} = this.props;
        // get WhatsGood items from server
        socket.emit('client > server get WhatsGood items', this.updateItems);
    }

  render() {
      const {items} = this.state;
      const {colors, socket} = this.props;
    return (
        <div className="whatsGood">
            <div className="mainWrap">
                {items.map( (item, i) => {
                    return(
                        <WhatsGoodItem 
                            item = {item}
                            colors = {(colors[item.key] || colors.default)}
                            key = {i}
                            socket = {socket}
                        />
                    );
                })}
            </div>
        </div>
    );
  }
}

export default WhatsGood;
