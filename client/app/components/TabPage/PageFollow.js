import React, { Component } from 'react';

class PageFollow extends Component {

  constructor(props){
    super(props);

    this.state = {
        loading : true,
        isFollower : false
    }
  }

  serverAnswer = (isFollower) => {
    this.setState({isFollower, loading : false});
  }

  followAnswer = (answer) => {
    if(answer){
        this.setState({isFollower: true});
    }
  }

  unfollowAnswer = (answer) => {
    if(answer){
        this.setState({isFollower: false});
    }
  }

  follow = () => {
    const {socket, user, pageId, pageKey} = this.props;
    socket.emit('client > server followPage', user.getBasic(), pageId, pageKey, this.followAnswer);
  }

  unfollow = () => {
    const {socket, user, pageId, pageKey} = this.props;
    socket.emit('client > server unfollowPage', user.getBasic(), pageId, pageKey, this.unfollowAnswer);
  }

  componentDidMount(){
    const {socket, pageKey, user} = this.props;
    //get followers from the server
    if(pageKey){ 
        socket.emit('client > server get pageIsFollower', user.getBasic(), pageKey, this.serverAnswer);
    }

  }

  render() {
    const {parentLoading, user, followers} = this.props;
    const {loading, isFollower} = this.state;
    let followersString;
    if(!isFollower){
        if(!followers){
            if(user.isLogged() && user.canThey('followPages'))
                followersString = 'be the first to follow this';
            else
                followersString = 'no one follows this';
        }
        else followersString = (followers == 1)?('1 person follows this'):(followers + ' people follow this'); 
    }else{
        if(followers == 1) followersString = 'you are the only one who follows this';
        else if(followers == 2) followersString = 'you and one other person follow this';
        else followersString = followers + ' people follow this';
    }
    return (
      <>
        {
            (parentLoading || loading)?(
                <div className="tbhFollow">
                {
                    (user && user.isLogged())?(
                        <div className="btn primary loading" />
                    ):('')
                }
                    
                    <div className="tbhFollowers loading" />
                </div>
            ):(
                <div className="tbhFollow">
                {
                    (user.isLogged() && user.canThey('followPages'))?(
                        (isFollower && user.canThey('unfollowPages'))?(
                        <div className="btn" onClick={this.unfollow}>unfollow</div>
                        ):(
                        <div className="btn primary" onClick={this.follow}>follow</div>
                        )
                    ):('')
                }
                    
                    <div className="tbhFollowers">
                        {followersString}
                    </div>
                </div>
            )
        }
      </>
    );
  }
}

export default PageFollow;
