import React, { Component } from 'react';
import Func from '../../Classes/Func';

import {
    Link,
    Redirect
  } from 'react-router-dom';

import Group from './Group';

class Groups extends Component {

  constructor(props){
    super(props);

    this.state = {
      groups : null,
      newGroup : null
    }
  }

  updateGroups = (groups) => {
      this.setState({groups});
  }

  refreshGroups = () => {
      const {socket} = this.props;

      socket.emit(`client > server get groups`, this.updateGroups);
  }

  addNewGroup = () => {
      let newGroup = {
        name : `new group`,
        isDefault : false,
        isStaff : false,
        permissions : {
            can_setAvatar : true,
            can_followPages : true,
            can_unfollowPages : true,
            can_likePosts : true,
            can_unlikePosts : true,
            can_seeComments : true,
            can_postComments : true,
            can_editComments : false,
            can_deleteComments : false,
            can_editOwnComments : true,
            can_deleteOwnComments : true,
            can_editChangelogs : false,

            can_writeBlogPosts : false,
            can_deleteBlogPosts : false,
            can_editBlogPosts : false,

            can_writePortfolioPosts : false,
            can_deletePortfolioPosts : false,
            can_editPortfolioPosts : false,

            can_writeGoodiesPosts : false,
            can_deleteGoodiesPosts : false,
            can_editGoodiesPosts : false,

            can_manageBugReports : false
        }
      };

      this.setState({newGroup});
  }

  componentDidMount() {
      const {socket} = this.props;
      this.refreshGroups();

      socket.on(`server > client refresh groups`, this.refreshGroups);
  }

  render() {
    const {socket, user} = this.props;
    const {groups, newGroup} = this.state;

    let groupsComps = (<></>);

    if(!groups) return (<></>);

    if(groups && groups.length) {
        groupsComps = (
            groups.map( (group, i) => {
                return (
                    <Group
                    key = {i}
                    group = {group}
                    user = {user}
                    socket = {socket}
                    />
                );
            })
        );
    }

    let newGroupComp = (<></>);
    let addNewBtn = (
        <div className="apgBtn">
            <div className="btn primary" onClick = {this.addNewGroup}>add new group</div>
        </div>
    );

    if(newGroup) {
        addNewBtn = (<></>);
        newGroupComp = (
            <Group
            key = {-1}
            group = {newGroup}
            user = {user}
            socket = {socket}
            addNew = {true}
            cancelForm = {() => this.setState({newGroup : null})}
            />
        );
    }

    return (
      <>
      <div className="mainWrap adminPageGroups">

        {groupsComps}
        {newGroupComp}
        {addNewBtn}

      </div>
      </>
    );
  }
}

export default Groups;
