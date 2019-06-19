import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import ImageUpload from '../Helpers/ImageUpload';
import Func from '../Classes/Func';
import Dropdown from '../Helpers/Dropdown';
import Toggle from '../Helpers/Toggle';
import Editor from '../Helpers/Editor';

class NewPortfolioPost extends TabPage {

  constructor(props){
    super(props);

    this.state = {
        post : {},
        redirect : null,
        ready: false,
        categories : [],
        showImagePicker : false,
        showThumbnailPicker : false,
        tags : '',
        errors : {
            title : [],
            subTitle : [],
            description : [],
            images : [],
            thumbnail : [],
            likes : [],
            views : [],
            featured : [],
            visible : [],
            postDate : [],
            catType : [],
            tags : [],
            showComments : []
        }
    }
  }

  resetErrors = () => {
      let errors = {
        title : [],
        subTitle : [],
        description : [],
        images : [],
        thumbnail : [],
        likes : [],
        views : [],
        featured : [],
        visible : [],
        postDate : [],
        catType : [],
        tags : [],
        showComments : []
    };
    this.setState({errors});
  }

  getDefaultPost = () => {
      return {
        title : '',
        subTitle : '',
        description : '',
        images : [],
        thumbnail : '',
        likes : 0,
        views : 0,
        featured : false,
        visible : true,
        postDate : '',
        catType : [],
        tags : [],
        showComments : true
      };
  }

  submitResponse = (data) => {
      if(!data.success){
          this.setState({errors : data.errors});
          return;
      }else{
          if(data._id){
            this.setState({redirect : `/portfolio/${data._id}/${Func.speakingUrl(data.title)}`});
            return;
          }
      }
  }

  submit = () => {
      this.resetErrors();
      let {post} = this.state;
      let cPost = $.extend(true,{}, post);
      const {user, socket, editing} = this.props;
      const {tags, categories} = this.state;
      let cats = [];
      for(let i = 0; i < categories.length; ++i){
          if(categories[i].selected && categories[i].key)
            cats.push(categories[i].key);
      }
      cPost.catType = cats;
      cPost.tags = tags.split(', ');
      if(cPost.tags.length == 1 && cPost.tags[0] == '') cPost.tags = [];
      
      if(cPost.postDate == "") {
        cPost.postDate = new Date(Date.now());
      }else {
        cPost.postDate = new Date(cPost.postDate);
      }
      
      if(editing){
          socket.emit(`client > server edit portfolioPost`, {
              userData : user.getBasic(),
              post : cPost
          }, this.submitResponse);
      }else{
          socket.emit(`client > server add new portfolioPost`, {
            userData : user.getBasic(),
            post : cPost
          }, this.submitResponse);
      }

  }

  updateCategories = (categories) => {
      const {post} = this.state;
    for(let i = 0; i < categories.length; ++i){
        categories[i].key = categories[i].catKey;
        categories[i].catKey = undefined;
        categories[i].selected = categories[i].default;
        if(post && post.catType.indexOf(categories[i].key) != -1)
            categories[i].selected = true;
        else if(post.catType.length) categories[i].selected = false;
    }
      this.setState({categories});
  }

  updatePost = (post) => {
      if(!post){
          this.setState({redirect : '/notfound'});
          return;
      }
      let {categories} = this.state;
      const {socket} = this.props;
      
      post.postDate = Func.fullDate(post.postDate);
      if(!categories.length)
        this.setState({post, selectedCategories : post.catType, ready : true},() => {
            socket.emit(`client > server get categories`, 'portfolio', this.updateCategories);
        });
      else
        this.setState({post, selectedCategories : post.catType, ready : true});
        
    let tags = '';
    if(post.tags) tags = post.tags.join(', ');
    this.setState({tags});
  }

  modPostDate = () => {
    let {post} = this.state;
    post.postDate = Func.fullDate(post.postDate);
    if(post.postDate == 'Invalid Date') post.postDate = '';
    this.setState({post});
  }

  componentDidMount(){
    const {editing, user, socket} = this.props;
    if(!user || !user.isLogged()){
        this.setState({redirect : '/notfound'});
        return;
    }
    if(editing){
        let data = {
            userData : user.getBasic(),
            postId : editing
        }
        socket.emit(`client > server edit PortfolioPost get`, data, this.updatePost);
    }else{
        if(!user.canThey('writePortfolioPosts')){
            this.setState({redirect : '/notfound'});
            return;
        }else{
            this.setState({
                post : this.getDefaultPost(),
                ready : true
            }, () => {
                socket.emit(`client > server get categories`, 'portfolio', this.updateCategories);
            });
        }
    }
    
  }

  changeUpdate = (e, field) => {
      let {post} = this.state;
      post[field] = e.target.value;
      this.setState({post});
  }

  pushImage = (img) => {
    if(!img || !img.length) return;
    let {post} = this.state;
    if(!post.images) post.images = [];
    post.images.push(img[0]);
    this.setState({post});
  }

  removeImage = (index) => {
      let {post} = this.state;
      post.images.splice(index, 1);
      this.setState({post});
  }

  updateThumbnailImage = (img) => {
    if(!img || !img.length) return;
    let {post} = this.state;
    post.thumbnail = img[0];
    this.setState({post});
  }

  removeThumbnail = () => {
      let {post} = this.state;
      post.thumbnail = '';
      this.setState({post});
  }

  updatePostAttr = (attr, val) => {
      let {post} = this.state;
      post[attr] = val;
      this.setState({post});
  }

  render() {
    let {post, redirect, ready, showImagePicker, categories, tags, errors, showThumbnailPicker} = this.state;

    if(redirect){
        return(
            <Redirect to={redirect} />
        );
    }
    if(!categories.length) ready = false;
    if(!ready) return (<></>);
    
    const {editing, user, socket} = this.props;

    let npcTitle = 'writing a portfolio post';
    let cancelLink = '/portfolio';
    if(editing) {
        npcTitle = 'editing a portfolio post';
        cancelLink = `/portfolio/${post._id}/${Func.speakingUrl(post.title)}`
    }

    let imagePicker = (<></>);
    if(showImagePicker) imagePicker = (
        <ImageUpload
        user={user}
        socket={socket}
        uploadPath='/posts'
        submitImage={this.pushImage}
        cancelImage={() => this.setState({showImagePicker : false})}
        multipleImages={false}
        floating={true}
        />
    );

    let thumbnailPicker = (<></>);
    if(showThumbnailPicker) thumbnailPicker = (
        <ImageUpload
        user={user}
        socket={socket}
        uploadPath='/posts'
        submitImage={this.updateThumbnailImage}
        cancelImage={() => this.setState({showThumbnailPicker : false})}
        multipleImages={false}
        floating={true}
        />
    );

    let removeThumbnailBtn = (<></>);

    if(post.thumbnail !== '') {
        removeThumbnailBtn = (
            <div className="btn" onClick = {this.removeThumbnail}>remove thumbnail</div>
        );
    }

    let errorsComp = {
        title : (<></>),
        subTitle : (<></>),
        description : (<></>),
        images : (<></>),
        thumbnail: (<></>),
        likes : (<></>),
        views : (<></>),
        featured : (<></>),
        visible : (<></>),
        postDate : (<></>),
        catType : (<></>),
        tags : (<></>),
        showComments : (<></>)
    }

    for(let k in errors) {
        if(errors[k].length){
            errorsComp[k] = (
                <div className="npcErrorsWrap">
                {
                    errors[k].map((err, i) => {
                        return (
                            <div key={`${k}${i}`} className="npcError">{err}</div>
                        );
                    })
                }
                </div>
            );
        }
    }

    let postImages = (
        <div className="npcImagesWrapNoImg">no images added</div>
    );

    if(post.images && post.images.length){
        postImages = (
            post.images.map( (imgSrc, i) => {
                return (
                    <div className="npcImage" key={i}>
                    <i className="pufficon-close"
                    data-tooltip="remove image"
                    onClick={() => this.removeImage(i)}
                    />
                    <img src={imgSrc} data-expandimage={true} />
                    </div>
                );
            })
        );
    }

    return (
      <>
      <div className="newPostCont">
      <div className="mainWrap">
        <div className="npcTitle">{npcTitle}</div>

        <div className="npcInputWrapRow">
            <div className="npcInputWrap">
                <div className="npcInputLabel">title</div>
                <div className="npcInputDesc">the title of this portfolio post. flex your brain muscles and try to be creative.</div>
                <input type="text"
                onChange={(e) => this.changeUpdate(e, 'title')}
                value={post.title}
                placeholder={`you won't believe what happened! click to find out!`}
                />
                {errorsComp.title}
            </div>

            <div className="npcInputWrap">
                <div className="npcInputLabel">subtitle</div>
                <div className="npcInputDesc">not really mandatory, only if you feel like it. (leave empty for no subtitle)</div>
                <input type="text"
                onChange={(e) => this.changeUpdate(e, 'subTitle')}
                value={post.subTitle}
                placeholder={`don't forget to leave a like and a comment!`}
                />
                {errorsComp.subTitle}
            </div>
        </div>
        
        <div className="npcInputWrap">
            <div className="npcInputLabel">category</div>
            <div className="npcInputDesc">select the category. you can select more than one option.</div>
            <Dropdown
            options = {categories}
            update = {(categories) => this.setState({categories})}
            multiple = {true}
            neverEmpty = {true}
            />
            {errorsComp.catType}
        </div>
        <div className="npcInputWrap">
            <div className="npcInputLabel">thumbnail</div>
                <div className="npcInputDesc">some cool looking image to attract attention over this here post. if there's no thumbnail we'll use the cover image ;)</div>
            <div className="npcThumbnailPreview"
            style={{backgroundImage : ((post.thumbnail !== '')?`url(${post.thumbnail})`:undefined)}}
            >
            {
                (post.thumbnail === '')?('no thumbnail selected'):('')
            }
            </div>
            <div className="npcHelpers">
                <div className="npcHelpersTop">
                    <div className="btn"
                    onClick={() => this.setState({showThumbnailPicker : true})}
                    ><i className="pufficon-image" /> <span>choose a thumbnail</span></div>
                    {removeThumbnailBtn}
                </div>
                <div className="npcHelpersWrap">{thumbnailPicker}</div>
            </div>
            
            {errorsComp.thumbnail}
        </div>

        <div className="npcInputWrap">
            <div className="npcInputLabel">images</div>
                <div className="npcInputDesc">add the images this entry will show. you can add more than one image. first image will be the main image.</div>
            <div className="npcImagesWrap">
            {postImages}
            </div>
            <div className="npcHelpers">
                <div className="npcHelpersTop">
                    <div className="btn"
                    onClick={() => this.setState({showImagePicker : true})}
                    ><i className="pufficon-image" /> <span>add an image</span></div>
                </div>
                <div className="npcHelpersWrap">{imagePicker}</div>
            </div>
            
            {errorsComp.images}
        </div>

        <div className="npcInputWrap">
            <div className="npcInputLabel">description</div>
            <div className="npcInputDesc">people may want to know what's going on.</div>
            <Editor
            user = {user}
            socket = {socket}
            text = {post.description}
            change = {(val) => this.updatePostAttr('description', val)}
            />
            {errorsComp.description}
        </div>

        <div className="npcInputWrap">
            <div className="npcInputLabel">tags</div>
            <div className="npcInputDesc">make your posts easier to be found. (tags must be comma-separated)</div>
            <input type="text" onChange={(e) => this.setState({tags : e.target.value})} value={tags} placeholder='your, tags, here' />
            
            {errorsComp.tags}
        </div>

        <div className="npcInputWrapRow">
            <div className="npcInputWrap">
                <div className="npcInputLabel">likes</div>
                <div className="npcInputDesc">you can modify the number of likes from here if you feel like cheating. (not recommended)</div>
                <input type="number" min={0} onChange={(e) => this.changeUpdate(e, 'likes')} value={post.likes} />
                
                {errorsComp.likes}
            </div>

            <div className="npcInputWrap">
                <div className="npcInputLabel">views</div>
                <div className="npcInputDesc">you can also crank up these numbers, you filthy cheater.</div>
                <input type="number" min={0} onChange={(e) => this.changeUpdate(e, 'views')} value={post.views} />
                
                {errorsComp.views}
            </div>  

            <div className="npcInputWrap">
                <div className="npcInputLabel">post date</div>
                <div className="npcInputDesc">use your time machine to change the course of history with this here post or leave empty to use today's date.</div>
                <input type="text" onBlur={this.modPostDate} onChange={(e) => this.changeUpdate(e, 'postDate')} value={post.postDate} placeholder={Func.fullDate(Date.now())} />
                
                {errorsComp.postDate}
            </div>  
        </div>

        <div className="npcInputWrapRow">
            <div className="npcInputWrap">
                <div className="npcInputLabel">featured</div>
                <div className="npcInputDesc">stick it into everyone's face cus it's your content and it should have priority.</div>
                <Toggle
                value = {post.featured}
                update = {(val) => this.updatePostAttr('featured', val)}
                />
                {errorsComp.featured}
            </div>

            <div className="npcInputWrap">
                <div className="npcInputLabel">visible</div>
                <div className="npcInputDesc">not everyone's worthy of your posts so hide them from prying eyes.</div>
                <Toggle
                value = {post.visible}
                update = {(val) => this.updatePostAttr('visible', val)}
                />
                {errorsComp.visible}
            </div>

            <div className="npcInputWrap">
                <div className="npcInputLabel">allow comments</div>
                <div className="npcInputDesc">public opinion can sometimes be hurtful. stay safe.</div>
                <Toggle
                value = {post.showComments}
                update = {(val) => this.updatePostAttr('showComments', val)}
                />
                {errorsComp.showComments}
            </div>
        </div>

        <div className="npcBtnsWrap">
            <div className="btn primary" onClick={this.submit}>submit</div>
            <Link to={cancelLink} className="btn">cancel</Link>
        </div>

      </div>
      </div>
      </>
    );
  }
}

export default NewPortfolioPost;
