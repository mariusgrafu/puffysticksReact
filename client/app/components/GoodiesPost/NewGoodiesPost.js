import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import ImageUpload from '../Helpers/ImageUpload';
import Func from '../Classes/Func';
import Dropdown from '../Helpers/Dropdown';
import Toggle from '../Helpers/Toggle';
import Editor from '../Helpers/Editor';

class NewGoodiesPost extends TabPage {

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
        platform : '',
        errors : {
            title : [],
            subTitle : [],
            description : [],
            cover : [],
            thumbnail : [],
            likes : [],
            views : [],
            featured : [],
            visible : [],
            postDate : [],
            catType : [],
            tags : [],
            releaseDate : [],
            updateDate : [],
            version : [],
            platform : [],
            showAlsoOnPlatform : [],
            showComments : [],
            allowBugReport : [],
            downloadUrl : [],
            showChangelog : [],
            changelog : []
        }
    }
  }

  resetErrors = () => {
      let errors = {
        title : [],
        subTitle : [],
        description : [],
        cover : [],
        thumbnail : [],
        likes : [],
        views : [],
        featured : [],
        visible : [],
        postDate : [],
        catType : [],
        tags : [],
        releaseDate : [],
        updateDate : [],
        version : [],
        platform : [],
        showAlsoOnPlatform : [],
        showComments : [],
        allowBugReport : [],
        downloadUrl : [],
        showChangelog : [],
        changelog : []
    };
    this.setState({errors});
  }

  getDefaultPost = () => {
      return {
        title : '',
        subTitle : '',
        description : '',
        cover : '',
        thumbnail : '',
        likes : 0,
        views : 0,
        featured : false,
        visible : true,
        postDate : '',
        catType : [],
        tags : [],
        releaseDate : {
            visible : true,
            value : Func.fullDate(Date.now())
        },
        updateDate : {
            visible : true,
            value : Func.fullDate(Date.now())
        },
        version : '',
        platform : [],
        showAlsoOnPlatform : true,
        showComments : true,
        allowBugReport : true,
        downloadUrl : '',
        showChangelog : false,
        changelog : null
      };
  }

  submitResponse = (data) => {
      if(!data.success){
          this.setState({errors : data.errors});
          return;
      }else{
          if(data._id){
            this.setState({redirect : `/goodies/${data._id}/${Func.speakingUrl(data.title)}`});
            return;
          }
      }
  }

  submit = () => {
      this.resetErrors();
      let {post} = this.state;
      let cPost = $.extend(true,{}, post);
      const {user, socket, editing} = this.props;
      const {tags, categories, platform} = this.state;
      let cats = [];
      for(let i = 0; i < categories.length; ++i){
          if(categories[i].selected && categories[i].key)
            cats.push(categories[i].key);
      }
      cPost.catType = cats;
      cPost.tags = tags.split(', ');
      if(cPost.tags.length == 1 && cPost.tags[0] == '') cPost.tags = [];
      cPost.platform = platform.split(', ');

      if(cPost.postDate == "") {
        cPost.postDate = new Date(Date.now());
      }else {
        cPost.postDate = new Date(cPost.postDate);
      }

      cPost.releaseDate.value = new Date(cPost.releaseDate.value);
      cPost.updateDate.value = new Date(cPost.updateDate.value);
      
      if(editing){
          socket.emit(`client > server edit goodiesPost`, {
              userData : user.getBasic(),
              post : cPost
          }, this.submitResponse);
      }else{
          socket.emit(`client > server add new goodiesPost`, {
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
      post.releaseDate.value = Func.fullDate(post.releaseDate.value);
      post.updateDate.value = Func.fullDate(post.updateDate.value);
      if(!categories.length)
        this.setState({post, selectedCategories : post.catType, ready : true},() => {
            socket.emit(`client > server get categories`, 'goodies', this.updateCategories);
        });
      else
        this.setState({post, selectedCategories : post.catType, ready : true});
        
    let tags = '';
    if(post.tags) tags = post.tags.join(', ');
        
    let platform = '';
    if(post.platform) platform = post.platform.join(', ');
    this.setState({tags, platform});
  }

  modPostDate = () => {
    let {post} = this.state;
    post.postDate = Func.fullDate(post.postDate);
    if(post.postDate == 'Invalid Date') post.postDate = '';
    this.setState({post});
  }

  modReleaseDate = () => {
    let {post} = this.state;
    post.releaseDate.value = Func.fullDate(post.releaseDate.value);
    if(post.releaseDate.value == 'Invalid Date') post.releaseDate.value = '';
    this.setState({post});
  }

  modUpdateDate = () => {
    let {post} = this.state;
    post.updateDate.value = Func.fullDate(post.updateDate.value);
    if(post.updateDate.value == 'Invalid Date') post.updateDate.value = '';
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
        socket.emit(`client > server edit GoodiesPost get`, data, this.updatePost);
    }else{
        if(!user.canThey('writeGoodiesPosts')){
            this.setState({redirect : '/notfound'});
            return;
        }else{
            this.setState({
                post : this.getDefaultPost(),
                ready : true
            }, () => {
                socket.emit(`client > server get categories`, 'goodies', this.updateCategories);
            });
        }
    }
    
  }

  changeUpdate = (e, field) => {
      let {post} = this.state;
      post[field] = e.target.value;
      this.setState({post});
  }

  updateCover = (img) => {
    if(!img || !img.length) return;
    let {post} = this.state;
    post.cover = img[0];
    this.setState({post});
  }

//   removeImage = (index) => {
//       let {post} = this.state;
//       post.images.splice(index, 1);
//       this.setState({post});
//   }

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

  updateReleaseDateVis = (val) => {
      let {post} = this.state;
      post.releaseDate.visible = val;
      this.setState({post});
  }

  updateReleaseDateVal = (val) => {
      let {post} = this.state;
      post.releaseDate.value = val;
      this.setState({post});
  }

  updateUpdateDateVis = (val) => {
      let {post} = this.state;
      post.updateDate.visible = val;
      this.setState({post});
  }

  updateUpdateDateVal = (val) => {
      let {post} = this.state;
      post.updateDate.value = val;
      this.setState({post});
  }

  updateShowChangelog = (val) => {
      let {post, errors} = this.state;
      if(val == true){
        if(post.changelog) post.showChangelog = true;
        else{
            errors.showChangelog[0] = 'this goodie has no changelog!';
            post.showChangelog = false;
        }
      }else{
          post.showChangelog = false;
      }

      this.setState({post, errors});
  }

  render() {
    let {post, redirect, ready, showImagePicker, categories, tags, platform, errors, showThumbnailPicker} = this.state;

    if(redirect){
        return(
            <Redirect to={redirect} />
        );
    }
    if(!categories.length) ready = false;
    if(!ready) return (<></>);
    
    const {editing, user, socket} = this.props;

    let npcTitle = 'writing a goodies post';
    let cancelLink = '/goodies';
    if(editing) {
        npcTitle = 'editing a goodies post';
        cancelLink = `/goodies/${post._id}/${Func.speakingUrl(post.title)}`
    }

    let imagePicker = (<></>);
    if(showImagePicker) imagePicker = (
        <ImageUpload
        user={user}
        socket={socket}
        uploadPath='/posts'
        submitImage={this.updateCover}
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
        cover : (<></>),
        thumbnail : (<></>),
        likes : (<></>),
        views : (<></>),
        featured : (<></>),
        visible : (<></>),
        postDate : (<></>),
        catType : (<></>),
        tags : (<></>),
        releaseDate : (<></>),
        updateDate : (<></>),
        version : (<></>),
        platform : (<></>),
        showAlsoOnPlatform : (<></>),
        showComments : (<></>),
        allowBugReport : (<></>),
        downloadUrl : (<></>),
        changelog : (<></>)
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

    return (
      <>
      <div className="newPostCont">
      <div className="mainWrap">
        <div className="npcTitle">{npcTitle}</div>

        <div className="npcInputWrapRow">
            <div className="npcInputWrap">
                <div className="npcInputLabel">title</div>
                <div className="npcInputDesc">the title of this goodies post. flex your brain muscles and try to be creative.</div>
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
                <div className="npcInputLabel">download url</div>
                <div className="npcInputDesc">the download url (leave empty if there is none)</div>
                <input type="text"
                onChange={(e) => this.changeUpdate(e, 'downloadUrl')}
                value={post.downloadUrl}
                placeholder={`download-link.here`}
                />
                {errorsComp.downloadUrl}
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
            <div className="npcInputLabel">cover</div>
                <div className="npcInputDesc">summarize what this good can do with one eye-catching image. easy, right?</div>
            {
                (post.cover)?(
                    <img className="npcImage" src={post.cover} />
                ):('')
            }
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
            <div className="npcInputLabel">version</div>
            <div className="npcInputDesc">does this goodie have a version? what is it?</div>
            <input type="text" onChange={(e) => this.changeUpdate(e, 'version')} value={post.version} placeholder='v0.0.0' />
            
            {errorsComp.version}
        </div>

        <div className="npcInputWrap">
            <div className="npcInputLabel">tags</div>
            <div className="npcInputDesc">make your posts easier to be found. (tags must be comma-separated)</div>
            <input type="text" onChange={(e) => this.setState({tags : e.target.value})} value={tags} placeholder='your, tags, here' />
            
            {errorsComp.tags}
        </div>

        <div className="npcInputWrap">
            <div className="npcInputLabel">platform</div>
            <div className="npcInputDesc">the platforms this goodie is for. (input must be comma-separated)</div>
            <input type="text" onChange={(e) => this.setState({platform : e.target.value})} value={platform} placeholder='platforms, go, here' />
            
            {errorsComp.platform}
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
                <div className="npcInputLabel">show release date</div>
                <div className="npcInputDesc">does this goodie have a release date?</div>
                <Toggle
                value = {post.releaseDate.visible}
                update = {this.updateReleaseDateVis}
                />
                {errorsComp.releaseDate}
            </div>  
            {
                (post.releaseDate.visible)?(
                    <div className="npcInputWrap">
                        <div className="npcInputLabel">release date</div>
                        <div className="npcInputDesc">when will/did this goodie release?</div>
                        <input type="text"
                        onBlur={this.modReleaseDate}
                        onChange={(e) => this.updateReleaseDateVal(e.target.value)}
                        value={post.releaseDate.value}
                        placeholder={Func.fullDate(Date.now())}
                        />

                        {errorsComp.releaseDate}
                    </div>
                ):('')
            }
        </div>

        <div className="npcInputWrapRow">
            <div className="npcInputWrap">
                <div className="npcInputLabel">show update date</div>
                <div className="npcInputDesc">what this goodie updated?</div>
                <Toggle
                value = {post.updateDate.visible}
                update = {this.updateUpdateDateVis}
                />
                {errorsComp.updateDate}
            </div>  
            {
                (post.updateDate.visible)?(
                    <div className="npcInputWrap">
                        <div className="npcInputLabel">update date</div>
                        <div className="npcInputDesc">when did this goodie got updated?</div>
                        <input type="text"
                        onBlur={this.modUpdateDate}
                        onChange={(e) => this.updateUpdateDateVal(e.target.value)}
                        value={post.updateDate.value}
                        placeholder={Func.fullDate(Date.now())}
                        />

                        {errorsComp.updateDate}
                    </div>
                ):('')
            }
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
        </div>

        <div className="npcInputWrapRow">
            <div className="npcInputWrap">
                <div className="npcInputLabel">allow comments</div>
                <div className="npcInputDesc">public opinion can sometimes be hurtful. stay safe.</div>
                <Toggle
                value = {post.showComments}
                update = {(val) => this.updatePostAttr('showComments', val)}
                />
                {errorsComp.showComments}
            </div>

            <div className="npcInputWrap">
                <div className="npcInputLabel">also on platform</div>
                <div className="npcInputDesc">show other goodies made for this platform.</div>
                <Toggle
                value = {post.showAlsoOnPlatform}
                update = {(val) => this.updatePostAttr('showAlsoOnPlatform', val)}
                />
                {errorsComp.showAlsoOnPlatform}
            </div>

            <div className="npcInputWrap">
                <div className="npcInputLabel">show changelog</div>
                <div className="npcInputDesc">you must first have what changelog to show.</div>
                <Toggle
                value = {post.showChangelog}
                update = {this.updateShowChangelog}
                />
                {errorsComp.showChangelog}
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

export default NewGoodiesPost;
