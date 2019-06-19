import React, { Component } from 'react';
import Func from '../Classes/Func';
import { Link } from 'react-router-dom';

class ProfileOverview extends Component {

  constructor(props){
    super(props);

  }

  render() {
    const {user, socket} = this.props;

    return (
      <>
        <div className="profileSectionTitle">account overview</div>

        <div className="profileOverviewDetails">
            
            <div className="profileOverviewDetail">
                <dt>display name</dt>
                <dd>{user.displayName}</dd>
            </div>

            <div className="profileOverviewDetail">
                <dt>email</dt>
                <dd>{user.email}</dd>
            </div>

            <div className="profileOverviewDetail">
                <dt>user since</dt>
                <dd>{Func.fullDate(user.signUpDate)}</dd>
            </div>
        </div>
      </>
    );
  }
}

export default ProfileOverview;
