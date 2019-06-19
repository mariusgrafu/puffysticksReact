import React, { Component } from 'react';
import Func from '../Classes/Func';
import { Link } from 'react-router-dom';

import Toggle from '../Helpers/Toggle';

class ProfilePreferences extends Component {

  constructor(props){
    super(props);

  }

  render() {
    const {user, socket} = this.props;

    return (
      <>
        <div className="profileSectionTitle">account preferences</div>
        
        <div className="profilePrefsCont">
            <div className="profilePrefWrap">
                <div className="profilePrefTitle">see featured blog articles</div>
                <Toggle
                value = {user.preferences.showFeaturedBlogPosts}
                update = {(val) => user.updatePrefs('showFeaturedBlogPosts', val)}
                />
            </div>
            
            <div className="profilePrefWrap">
                <div className="profilePrefTitle">see featured portfolio posts</div>
                <Toggle
                value = {user.preferences.showFeaturedPortfolioPosts}
                update = {(val) => user.updatePrefs('showFeaturedPortfolioPosts', val)}
                />
            </div>

            <div className="profilePrefWrap">
                <div className="profilePrefTitle">see featured goodies posts</div>
                <Toggle
                value = {user.preferences.showFeaturedGoodiesPosts}
                update = {(val) => user.updatePrefs('showFeaturedGoodiesPosts', val)}
                />
            </div>
        </div>
      </>
    );
  }
}

export default ProfilePreferences;
