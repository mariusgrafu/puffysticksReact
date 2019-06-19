import React, { Component } from 'react';
import Func from '../../Classes/Func';
import Toggle from '../../Helpers/Toggle';
import Permission from '../../Classes/Permission';

import {
    Link,
    Redirect
  } from 'react-router-dom';

class Group extends Component {

  constructor(props){
    super(props);

    this.state = {
      group : null,
      editing : false,

      permissionsDefault : new Permission()
    }
  }

  refreshGroup = () => {
    const {group} = this.props;
    let cGroup = $.extend(true,{}, group);
    this.setState({group : cGroup});
  }

  componentDidMount() {
      this.refreshGroup();
  }

  updateGroupAttr = (k, v) => {
      let {group} = this.state;
      group[k] = v;
      this.setState({group});
  }

  updatePermission = (k, v) => {
      let {group} = this.state;
      group.permissions[k] = v;
      this.setState({group});
  }

  cancelEdit = () => {
      let {addNew, cancelForm} = this.props;
      if(addNew){
          cancelForm();
          return;
      }
      this.refreshGroup();
      this.setState({editing : false});
  }

  saveEdit = () => {
      const {group} = this.state;
      const {user, socket, addNew, cancelForm} = this.props;
      let data = {
          userData : user.getBasic(),
          group
      };
      socket.emit(`client > server edit group`, data);

      this.setState({editing : false});

      if(addNew == true) {
          cancelForm();
      }
  }

  deleteGroup = () => {
      const {group} = this.state;
      if(group.isDefault) return;
      const {user, socket} = this.props;
      let data = {
          userData : user.getBasic(),
          groupId : group._id
      };

      socket.emit(`client > server delete group`, data);
  }

  render() {
    const {group, editing, permissionsDefault} = this.state;
    const {addNew} = this.props;

    if(!group) return (<></>);

    if(addNew == true || editing) {
        let permToggs = [];
        for(let k in permissionsDefault)
            permToggs.push(
                <Toggle
                title = {k}
                key = {k}
                value = {group.permissions[k]}
                update = {(val) => this.updatePermission(k, val)}
                />
            );
        let deleteBtn = (<div className="btn" onClick={this.deleteGroup}>delete</div>);
        if(addNew == true || group.isDefault) deleteBtn = (<></>);
        return (
            <>
              <div className="apgGroupWrap editing">
                  <div className="apggInputWrap">
                    <div className="apggiTitle">name</div>
                    <input type="text" value={group.name} onChange={(e) => this.updateGroupAttr('name', e.target.value)} />
                  </div>
                  <div className="apggInputWrap">
                    <Toggle
                    title = {`is default`}
                    value = {group.isDefault}
                    update = {(val) => this.updateGroupAttr('isDefault', val)}
                    />
                  </div>
                  <div className="apggInputWrap">
                    <Toggle
                    title = {`is staff`}
                    value = {group.isStaff}
                    update = {(val) => this.updateGroupAttr('isStaff', val)}
                    />
                  </div>
                  <div className="apggInputWrap fullWidth">
                    <div className="apggiTitle">permissions</div>
                    <div className="apggiPerms">
                    {permToggs}
                    </div>
                    
                  </div>

                  <div className="apggBtns">
                  <div className="btn primary"
                  onClick = {this.saveEdit}
                  >save</div>
                  <div className="btn"
                  onClick = {this.cancelEdit}
                  >cancel</div>
                  {deleteBtn}
                  </div>
              </div>
            </>
          );
    }

    let isDefault = false;
    let isStaff = false;

    if(group.isDefault) {
        isDefault = (
            <div className="apggType">default</div>
        );
    }

    if(group.isStaff) {
        isStaff = (
            <div className="apggType">staff</div>
        );
    }

    let groupTypes = (<></>);

    if(isDefault || isStaff) {
        groupTypes = (
        <div className="apggTypes">
            {(isDefault)?(isDefault):('')}
            {(isStaff)?(isStaff):('')}
        </div>);
    }

    return (
      <>
        <div className="apgGroupWrap">
            {groupTypes}
            <div className="apggName">{group.name}</div>
            <div className="btn"
            onClick = {() => this.setState({editing : true})}
            >edit</div>
        </div>
      </>
    );
  }
}

export default Group;
