import React, { Component } from 'react';
import Func from '../../Classes/Func';
import Editor from '../../Helpers/Editor';

import {
    Link,
    Redirect
  } from 'react-router-dom';

class WhatsGoodItem extends Component {

  constructor(props){
    super(props);

    this.state = {
      item : null,
      editing : false
    }
  }

  refreshItem = () => {
    const {item} = this.props;
    let cItem= $.extend(true,{}, item);
    this.setState({item : cItem});
  }

  componentDidMount() {
      this.refreshItem();
  }

  updateItemAttr = (k, v) => {
      let {item} = this.state;
      item[k] = v;
      this.setState({item});
  }

  updateButton = (k, v) => {
      let {item} = this.state;
      item.button[k] = v;
      this.setState({item});
  }

  cancelEdit = () => {
      let {addNew, cancelForm} = this.props;
      if(addNew){
          cancelForm();
          return;
      }
      this.refreshItem();
      this.setState({editing : false});
  }

  saveEdit = () => {
      const {item} = this.state;
      const {user, socket, addNew, cancelForm} = this.props;
      let data = {
          userData : user.getBasic(),
          item
      };
      socket.emit(`client > server edit WhatsGood item`, data);

      this.setState({editing : false});

      if(addNew == true) {
          cancelForm();
      }
  }

  deleteItem = () => {
      const {item} = this.state;
      const {user, socket} = this.props;
      let data = {
          userData : user.getBasic(),
          itemId : item._id
      };

      socket.emit(`client > server delete WhatsGood item`, data);
  }

  render() {
    const {item, editing} = this.state;
    const {addNew, user, socket} = this.props;

    if(!item) return (<></>);

    if(addNew == true || editing) {
        let deleteBtn = (<div className="btn" onClick={this.deleteItem}>delete</div>);
        if(addNew == true) deleteBtn = (<></>);
        return (
            <>
            <div className="apwgItemWrap editing">
                <div className="apwgiInputWrap">
                    <div className="apwgiiTitle">title</div>
                    <input type="text"
                    value={item.title}
                    onChange = {(e) => this.updateItemAttr('title', e.target.value)}
                    />
                </div>
                <div className="apwgiInputWrap">
                    <div className="apwgiiTitle">key</div>
                    <input type="text"
                    value={item.key}
                    onChange = {(e) => this.updateItemAttr('key', e.target.value)}
                    />
                </div>
                <div className="apwgiInputWrap">
                    <div className="apwgiiTitle">description</div>
                    <Editor
                    user = {user}
                    socket = {socket}
                    text = {item.description}
                    change = {(val) => this.updateItemAttr('description', val)}
                    />
                </div>
                <div className="apwgiInputWrap">
                    <div className="apwgiiTitle">button title</div>
                    <input type="text"
                    value={item.button.title}
                    onChange = {(e) => this.updateButton('title', e.target.value)}
                    />
                </div>
                <div className="apwgiInputWrap">
                    <div className="apwgiiTitle">button url</div>
                    <input type="text"
                    value={item.button.to}
                    onChange = {(e) => this.updateButton('to', e.target.value)}
                    />
                </div>

                <div className="apwgiBtns">
                    <div className="btn primary"
                    onClick = {this.saveEdit}
                    >save</div>
                    {deleteBtn}
                    <div className="btn"
                    onClick = {this.cancelEdit}
                    >cancel</div>
                </div>
            </div>
            </>
          );
    }

    return (
      <>
        <div className="apwgItemWrap">
            <div className="apwgiKey">{item.key}</div>
            <div className="apwgiTitle">{item.title}</div>
            <div className="apwgiDescr" dangerouslySetInnerHTML={{__html : item.description}} />
            <div className="apwgiBtn">
                <a href={item.button.to} target="_blank" class="btn">{
                    item.button.title}
                </a>
            </div>

            <div className="apwgiBtns">
                <div className="btn primary"
                onClick = {() => this.setState({editing: true})}
                >edit</div>
            </div>
        </div>
      </>
    );
  }
}

export default WhatsGoodItem;
