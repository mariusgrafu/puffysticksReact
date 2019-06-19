import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Func from '../Classes/Func';

class WhatsGoodItem extends Component {

    constructor(props){
        super(props);

        this.state = {
            post : null,
            url : ''
        }
    }

    updatePost = (post) => {
        const {item} = this.props;
        let url = '';
        switch(item.key){
            case 'blog':
            url = `/blog/${post._id}/${(Func.speakingUrl(post.title))}`;
            break;
            case 'goodies':
            url = `/goodies/${post._id}/${(Func.speakingUrl(post.title))}`;
            break;
            case 'portfolio':
            url = `/portfolio/${post._id}/${(Func.speakingUrl(post.title))}`;
            post.cover = post.images[0];
            break;
        }
        this.setState({post, url});
    }

    componentDidMount(){
        const {socket, item} = this.props;
        socket.emit('client > server whatsGood getPost', item.key, this.updatePost);
    }

    render() {
      const {item} = this.props;
      const {post, url} = this.state;
      const {colors} = this.props;
    let postbg = {};
    if(post) postbg = {
        style : {
            backgroundImage: `url(${(post.thumbnail != undefined && post.thumbnail != '')?(post.thumbnail):(post.cover)})`
        }
    }
    return (
        <>
        <style>
            {
                `[data-key=${item.key}] .wgiPostWrap{
                    box-shadow: inset 0 0 0 5px ${colors.accent};
                    background-color: ${colors.accent};
                }
                [data-key=${item.key}] .wgiPostWrapFeatured{
                    background-color: ${colors.accent};
                    color: ${colors.text};
                }
                [data-key=${item.key}] .btn{
                    color: ${colors.text} !important;
                    background-color: ${colors.accent};
                    transition: all .2s;
                }
                [data-key=${item.key}] .whatsGoodItemBG{
                    fill: ${colors.accent};
                }
                [data-key=${item.key}]:hover .btn{
                    color: ${colors.accent} !important;
                    background-color: ${colors.text};
                }
                [data-key=${item.key}]:hover .wgiDesc{
                    color: ${colors.text} !important;
                }
                [data-key=${item.key}]:hover .wgiTitle{
                    color: ${colors.text} !important;
                }
                [data-key=${item.key}]:hover .wgiTitleDot{
                    background-color: ${colors.text} !important;
                }
                [data-key=${item.key}]:hover .whatsGoodItemBG .wgiSplash{
                    transform: scale(1);
                    opacity: 1;
                }
                [data-key=${item.key}]:hover .whatsGoodItemBG g{
                    transform: scale(1);
                    opacity: 1;
                }
                `
            }
        </style>
      <div className="whatsGoodItemWrap" data-key={item.key}>
        <div className="whatsGoodItem">
                {
                    (post)?(
                    <Link to={url} className="wgiPostWrap" {...postbg} >
                                <div className="wgiPostWrapFeatured">featured</div>
                        
                    </Link> ):('')
                }
            <div className="wgiTitle">
                {item.title}
                <span className="wgiTitleDot"
                style={{backgroundColor : colors.accent}}
                ></span>
            </div>
            <div className="wgiDesc" dangerouslySetInnerHTML={{__html: item.description}} />
            <Link to={item.button.to} className="btn primary">{item.button.title}</Link>
        </div>
        <svg className="whatsGoodItemBG" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1245.3 1416.2">
        
            <path className="wgiSplash" d="M1181.4,232.4c-4.8-127.9-47.7-79.9-187.3-151.9C853.6,8.5,656.6-29.4,542,27.6 c-114.3,57-172.6,73.9-300.8,31.9C111.8,17.5,70.4,109,14.5,209c-55.9,102.6,70.4,134.2,39.7,261.4C29,585.8,61.4,654.1,97.5,710.1 c36.6,56,77.1,99.6,79,165.6c3.5,132.1-38.7,143.9-1.7,305.9c35.3,162,178.4,30,193.2,129c14,99,103.4,114,204,102 c100.9-12,93.4-87,187.3-102c95-15,136.6,66,200.8,51c64.9-15,63.1-102,59.6-240c-3.9-138,24-141,72.3-288 c48.1-147,77.9-201,46.7-309.6C1105.7,415.4,1184.2,364.3,1181.4,232.4z"
            />
            <g>
            <path d="M83.5,804.5c-24-2.7-22.7,29.3-22.7,29.3c2.7,64,40,74.7,56,70c16-4.7,9.3-41.3,7.3-66 C122.2,813.2,107.5,807.2,83.5,804.5z"
            />
            <path d="M66.3,1018c-11.1-6.3-25.1-0.2-28.8,12c-9.1,29.7,19.5,35.7,29.4,38.6c11.3,3.3,12.7-23.3,7.3-40.7 C72.7,1023.1,69.8,1020,66.3,1018z"
            />
            <path d="M1221.5,397.9c-32-15.3-45.3,29.3-45.3,29.3c-9.3,26,14,43.3,35.3,47.3c21.3,4,26-10.4,30-32.4 S1253.5,413.2,1221.5,397.9z"
            />
            </g>
        </svg>
      </div>
      </>
    );
  }
}

export default WhatsGoodItem;
