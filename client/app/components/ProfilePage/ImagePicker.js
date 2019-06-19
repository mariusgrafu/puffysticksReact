import React, { Component } from 'react';
import onClickOutside from "react-onclickoutside";
import ImageUpload from '../Helpers/ImageUpload';

class ImagePicker extends Component{

    constructor(props){
        super(props);
    
        this.state = {
            url : (props.type == 'avatar')?(props.user.getAvatar() || ''):(props.user.cover || ''),
            type : (props.type || 'avatar'),
            mode : 'pick', // or 'upload',
            images : []
        };
    }

    updateImages = (siteSettings) => {
        if(!siteSettings) return;
        const {type} = this.state;
        let images = [];
        if(type == 'avatar') images = siteSettings.defaultAvatars;
        else images = siteSettings.defaultCovers;
        this.setState({images});
    }

    componentDidMount() {
        const {socket} = this.props;

        socket.emit('client > server get siteSettings', this.updateImages);
    }

    doCancel = () => {
        const {cancel} = this.props;
        if(cancel != undefined) cancel();
    }

    doSubmit = () => {
        const {submit} = this.props;
        const {url} = this.state;
        if(submit != undefined) submit(url);
        this.doCancel();
    }

    handleClickOutside = evt => {
        evt.preventDefault();
        this.doCancel();
    };

    uploadImageRes = (img) => {
        if(!img || !img.length) return;
        this.setState({url : img[0]});
    }

    render(){
        const {url, type, images} = this.state;
        let {mode} = this.state;
        const {socket, user} = this.props;

        let modeComp = (<></>);

        if(!images || !images.length) mode = 'upload';

        if(mode == 'upload') {
            modeComp = (
                <ImageUpload
                user={user}
                socket={socket}
                uploadPath='/users'
                submitImage={this.uploadImageRes}
                multipleImages={false}
                floating={false}
                />
            );
        }else if(mode == 'pick') {
            modeComp = (
                <div className="pipPickCollection">
                {
                    images.map( (img, i) => {
                        return (
                            <div
                            key = {i}
                            onClick = {() => this.setState({url : img})}
                            className={`pipPcItem${((img == url)?(' selected'):(''))}`}
                            style={{backgroundImage : `url(${img})`}}
                            ></div>
                        );
                    })
                }
                </div>
            );
        }
        
        return (
            <>
            <div className="profileImagePicker">
                <div className="pipPreviewCont">
                    <div className="pipPreviewTitle">preview</div>
                    <div className={`pipPreview ${type}`}
                    style={{backgroundImage : `url(${url})`}}
                    />
                </div>
                <div className="pipModeNav noSelect">
                    {
                        (images && images.length)?(
                            <>
                            <div
                            className={`pipModeNavItem${((mode == 'pick')?(' selected'):(''))}`}
                            onClick={() => this.setState({mode : 'pick'})}
                            >pick an image
                            </div>
                            <div
                            className={`pipModeNavItem${((mode == 'upload')?(' selected'):(''))}`}
                            onClick={() => this.setState({mode : 'upload'})}
                            >supply your own
                            </div>
                            </>
                        ):('')
                    }
                    
                </div>

                <div className="pipModeCont">
                    {modeComp}
                </div>

                <div className="pipBtns">
                    <div className="btn primary" onClick={this.doSubmit}>submit</div>
                    <div className="btn" onClick={this.doCancel}>cancel</div>
                </div>
            </div>
            </>
        );
    }

}; 

export default onClickOutside(ImagePicker);
