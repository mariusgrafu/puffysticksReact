import React, { Component } from 'react';

class ImageUpload extends Component{

    constructor(props){
        super(props);
    
        this.state = {
            imgUplType : 'upload',
            uploadErrors : [],
            urlErrors : [],
            files : [],
            imgUrl : '',
            thumbnail : null
        };
    }

    getDefaultExtensions = () => {
        return ['png', 'gif', 'svg', 'jpg', 'jpeg'];
    }

    updateThumbnail = (thumbnail) => {
        this.setState({thumbnail});
    }

    uploadChange = (e) => {
        let files = e.target.files;

        let reader = new FileReader();
        if(files.length){
            ((file) => {
                reader.onload = (e) => {
                    this.updateThumbnail(e.target.result);
                }
                reader.readAsDataURL(file);
            })(files[0]);
        }

        const arrayBufferPromiseFromBlob = (blob) => {
            //argument must be blob or file Object
            return new Promise(function (resolve, reject) {

                reader = new FileReader();
                reader.onload = function (event) {
                    resolve(reader.result);
                };
                reader.onerror = function (error) {
                    reject(error);
                };
                reader.readAsArrayBuffer(blob);
            });
        };

        for (let i = 0; i < files.length; ++i) {         
            (function(file) {
                let reader = new FileReader();  
                reader.readAsArrayBuffer(file);
                reader.onload = function(e) { 
                    file.data = new Buffer(new Uint8Array(e.target.result));
                }
            })(files[i]);
        }

        let allPromises = [];

        for (let i = 0; i < files.length; ++i) {         
            allPromises.push(arrayBufferPromiseFromBlob(files[i]));
        }
        Promise.all(allPromises)
        .then( (values) => {
            
            let newFiles = [];
            for(let i = 0; i < values.length; ++i){
                //files[i].data = new Buffer(new Uint8Array(values[i]));
                newFiles.push({
                    name : files[i].name,
                    data : new Buffer(new Uint8Array(values[i]))
                });
            }
            this.setState({files : newFiles});
        });
    }

    uploadResponse = (res) => {
        if(res.error){
            this.setState({uploadErrors : res.errors});
            return;
        }
        
        const {cancelImage, submitImage} = this.props;
        submitImage(res.urls);
        if(cancelImage != undefined) cancelImage();
    }

    doSubmit = () => {
        const {imgUplType} = this.state;
        if(imgUplType == 'upload'){
            let {files} = this.state;
            const {socket, uploadPath, extensions} = this.props;
            
            socket.emit(`client > server uploadImage`, {
                files,
                uploadPath,
                extensions
            }, this.uploadResponse);
            
        }else if(imgUplType == 'url'){
            let {imgUrl, urlErrors} = this.state;
            let {extensions} = this.props;
            if(extensions == undefined) extensions = this.getDefaultExtensions();
            let ext = imgUrl.split('.').pop(); 
            if(extensions.indexOf(ext) == -1){
                this.setState({urlErrors : ['forbidden extension!']});
                return;
            }
            const {cancelImage, submitImage} = this.props;
            submitImage([imgUrl]);
            if(cancelImage != undefined) cancelImage();
        }
    }

    urlChange = (e) => {
        this.setState({imgUrl : e.target.value});
    }

    render(){
        const {cancelImage, multipleImages, floating} = this.props;
        let {extensions} = this.props;
        const {imgUplType, thumbnail, files, uploadErrors, urlErrors, imgUrl} = this.state;
        let imgUplTypeComp = (<></>);
        let cancelImageComp = (<></>);

        if(extensions == undefined || !extensions.length){
            extensions = this.getDefaultExtensions();
        }

        switch(imgUplType) {
            case 'upload':
            imgUplTypeComp = (
                <div className="imgUplTypeUploadWrap">
                    <input
                    type="file"
                    multiple={multipleImages}
                    onChange={this.uploadChange}
                    />
                    <div className="iutuCont">
                        <div className="iutuThumb"
                        style={((thumbnail)?({backgroundImage: `url(${thumbnail})`}):(undefined))}
                        >
                        {
                            (files.length > 1)?(
                                <div className="iutuThumbOther">
                                and {files.length - 1} more
                                </div>
                            ):('')
                        }
                        </div>
                        <div className="iutuInfo">
                        {
                            (files.length)?(
                                <div className="iutuiNum">
                                    {files.length} image{((files.length != 1)?'s':'')} selected
                                </div>
                            ):('')
                        }
                        <div className="iutuiInstr">drop the image{((multipleImages)?'s':'')} here</div>
                        <div className="iutuiExtWrap">
                            <div className="iutuiewTitle">allowed extensions</div>
                            <div className="iutuiExtensions">
                            {
                                extensions.map( (ext, i) => {
                                    return(
                                        <div className="iutuiExt" key={i}>{ext}</div>
                                    );
                                })
                            }
                            </div>
                        </div>
                        </div>
                    </div>
                    {
                        (uploadErrors.length)?(
                            <div className="iutuiErrorsWrap">
                                {
                                    uploadErrors.map( (err, i) => {
                                        return (
                                            <div className="iutuiError" key={i}>
                                            {err}
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        ):('')
                    }
                    
                </div>
            );
            break;
            case 'url':
            imgUplTypeComp = (
                <div className="imgUplTypeUrlWrap">

                    <div className="imgUplTypeUrlWrapRight">
                    <input
                    type="text"
                    placeholder="--> url here <--"
                    onChange={this.urlChange}
                    value={imgUrl}
                    />
                    
                    <div className="iutuiExtWrap">
                            <div className="iutuiewTitle">allowed extensions</div>
                            <div className="iutuiExtensions">
                            {
                                extensions.map( (ext, i) => {
                                    return(
                                        <div className="iutuiExt" key={i}>{ext}</div>
                                    );
                                })
                            }
                            </div>
                    </div>
                    </div>
                    {
                        (urlErrors.length)?(
                            <div className="iutuiErrorsWrap">
                                {
                                    urlErrors.map( (err, i) => {
                                        return (
                                            <div className="iutuiError" key={i}>
                                            {err}
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        ):('')
                    }
                    
                </div>
            );
            break;
        }

        if(cancelImage != undefined) {
            cancelImageComp = (
                <div className="btn" onClick={cancelImage}>cancel</div>
            );
        }

        return (
        <div className={`imageUpload${((floating == true)?' floating':'')}`}>
            <div className="imgUplTypes noSelect">
                <div className={`imgUplType${((imgUplType == 'upload')?' tgld':'')}`}
                onClick={() => this.setState({imgUplType : 'upload'})}
                >upload</div>
                <div className={`imgUplType${((imgUplType == 'url')?' tgld':'')}`}
                onClick={() => this.setState({imgUplType : 'url'})}
                >url</div>
            </div>
            <div className="imgUplTypeWrap">{imgUplTypeComp}</div>
            <div className="imgUplBtnWrap">
                <div className="btn primary" onClick={this.doSubmit}>submit image</div>
                {cancelImageComp}
            </div>
        </div>
        );
    }

}; 

export default ImageUpload;
