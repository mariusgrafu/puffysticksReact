import React, { Component } from 'react';
import Func from '../../Classes/Func';

import {
    Link,
    Redirect
  } from 'react-router-dom';

import WhatsGoodItem from './WhatsGoodItem';

class WhatsGood extends Component {

  constructor(props){
    super(props);

    this.state = {
      items : null,
      newItem : null
    }
  }

  updateItems = (items) => {
      this.setState({items});
  }

  refreshItems = () => {
      const {socket} = this.props;

      socket.emit(`client > server get WhatsGood items`, this.updateItems);
  }

  addNewItem = () => {
      let newItem = {
        title : 'new item',
        description : 'description here',
        button : {
            title : 'button name',
            to : '/'
        },
        key : '#myKey'
      };

      this.setState({newItem});
  }

  componentDidMount() {
      const {socket} = this.props;
      this.refreshItems();

      socket.on(`server > client refresh WhatsGood items`, this.refreshItems);
  }

  render() {
    const {socket, user} = this.props;
    const {items, newItem} = this.state;

    let itemsComps = (<></>);

    if(!items) return (<></>);

    if(items && items.length) {
        itemsComps = (
            items.map( (item, i) => {
                return (
                    <WhatsGoodItem
                    key = {i}
                    item = {item}
                    user = {user}
                    socket = {socket}
                    />
                );
            })
        );
    }

    let newItemComp = (<></>);
    let addNewBtn = (
        <div className="apwgBtn">
            <div className="btn primary" onClick = {this.addNewItem}>add new group</div>
        </div>
    );

    if(newItem) {
        addNewBtn = (<></>);
        newItemComp = (
            <WhatsGoodItem
            key = {-1}
            item = {newItem}
            user = {user}
            socket = {socket}
            addNew = {true}
            cancelForm = {() => this.setState({newItem : null})}
            />
        );
    }

    return (
      <>
      <div className="mainWrap adminPageWhatsGoodItems">
        {itemsComps}
        {addNewBtn}
        {newItemComp}
      </div>
      </>
    );
  }
}

export default WhatsGood;
