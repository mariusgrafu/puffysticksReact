import React, { Component } from 'react';
import Func from '../Classes/Func';
import {Link} from 'react-router-dom';

class AlsoOnPlatform extends Component {

  constructor(props){
    super(props);

    this.state = {
        posts : []
    }
  }

  updatePosts = (posts) => {
      this.setState({posts});
  }

  componentDidMount(){
    const {postId, platform, socket} = this.props;
    socket.emit(`client > server get alsoOnPlatform`, postId, platform, this.updatePosts);
  }

  render() {
    const {posts} = this.state;

    return (
      <>
        {
            (posts.length)?(
                <>
                <div className="gppcwrSubcat">also on this platform</div>
                <div className="gppcwrAlsoOnPlatformWrap">
                {
                    (posts.map( (post) => {
                        return(
                            <Link
                                to={`/goodies/${post._id}/${Func.speakingUrl(post.title)}`}
                                className="gppcwrAlsoOnPlatformItem"
                                style={{backgroundImage : `url(${post.cover})`}}
                                key={post._id}
                            />
                        );
                    }))
                }
                </div>
                </>
            ):('')
        }
      </>
    );
  }
}

export default AlsoOnPlatform;
