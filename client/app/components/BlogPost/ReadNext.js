import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Func from '../Classes/Func';

class ReadNext extends Component {

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
    const {socket, postId, tags, catType} = this.props;
    socket.emit(`client > server get blog ReadMore`, postId, tags, catType, this.updatePosts);
  }

  render() {
    const {posts} = this.state;

    return (
      <>
        {
            (posts && posts.length)?(
                <div className="bpReadMoreWrap">
                <div className="bpRMTitle">what to read next...</div>
                {
                    posts.map( (post) => {
                        return(
                            <Link to={`/blog/${post._id}/${Func.speakingUrl(post.title)}`} className="bpRMPost" key={post._id}>
                                <div className="bpRMPCover" style={{backgroundImage: `url(${post.cover})`}} />
                                <div className="bpRMPData">
                                    <div className="bpRMPDTitle">{post.title}</div>
                                    <div className="bpRMPDDate">{Func.formatDateFeaturedItems(post.postDate)}</div>
                                </div>
                            </Link>
                        );
                    })
                }
                </div>
            ):('')
        }
      </>
    );
  }
}

export default ReadNext;
