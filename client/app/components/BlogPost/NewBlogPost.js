import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import ImageUpload from '../Helpers/ImageUpload';
import Func from '../Classes/Func';
import Dropdown from '../Helpers/Dropdown';
import Toggle from '../Helpers/Toggle';
import Editor from '../Helpers/Editor';

class NewBlogPost extends TabPage {

  constructor(props){
    super(props);

    this.state = {
        post : {},
        redirect : null,
        ready: false,
        categories : [],
        showCoverPicker : false,
        showThumbnailPicker : false,
        hideAuthor : false,
        tags : '',
        errors : {
            title : [],
            subTitle : [],
            content : [],
            cover : [],
            thumbnail : [],
            likes : [],
            views : [],
            featured : [],
            visible : [],
            postDate : [],
            author : [],
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
        content : [],
        cover : [],
        thumbnail : [],
        likes : [],
        views : [],
        featured : [],
        visible : [],
        postDate : [],
        author : [],
        catType : [],
        tags : [],
        showComments : []
    };
    this.setState({errors});
  }

  getDefaultPost = () => {
      const {user} = this.props;
      return {
        title : '',
        subTitle : '',
        content : '',
        cover : null,
        thumbnail : '',
        likes : 0,
        views : 0,
        featured : false,
        visible : true,
        postDate : '',
        author : {
            _id : user.getBasic().userId,
            displayName : user.displayName,
            avatar : user.getAvatar()
        },
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
            this.setState({redirect : `/blog/${data._id}/${Func.speakingUrl(data.title)}`});
            return;
          }
      }
  }

  submit = () => {
      this.resetErrors();
      let {post} = this.state;
      let cPost = $.extend(true,{}, post);
      const {user, socket, editing} = this.props;
      const {hideAuthor, tags, categories} = this.state;
      let cats = [];
      for(let i = 0; i < categories.length; ++i){
          if(categories[i].selected && categories[i].key)
            cats.push(categories[i].key);
      }
      cPost.catType = cats;
      cPost.tags = tags.split(', ');
      if(cPost.tags.length == 1 && cPost.tags[0] == '') cPost.tags = [];
      
      if(hideAuthor) cPost.author = undefined;
      else cPost.author = post.author._id;
      
      if(cPost.postDate == "") {
        cPost.postDate = new Date(Date.now());
      }else {
        cPost.postDate = new Date(cPost.postDate);
      }
      
      if(editing){
          socket.emit(`client > server edit blogPost`, {
              userData : user.getBasic(),
              post : cPost
          }, this.submitResponse);
      }else{
          socket.emit(`client > server add new blogPost`, {
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
            socket.emit(`client > server get categories`, 'blog', this.updateCategories);
        });
      else
        this.setState({post, selectedCategories : post.catType, ready : true});
        
    let hideAuthor = false;
    let tags = '';
    if(post.tags) tags = post.tags.join(', ');
    if(post.author == undefined) hideAuthor = true;
    this.setState({hideAuthor, tags});
  }

  modPostDate = () => {
    let {post} = this.state;
    post.postDate = Func.fullDate(post.postDate);
    if(post.postDate == 'Invalid Date') post.postDate = '';
    this.setState({post});
  }

  toggleHideAuthor = (hideAuthor) => {
      let {post} = this.state;
      if(hideAuthor){
          this.setState({hideAuthor});
          return;
      }
      if(post.author == undefined){
        const {user} = this.props;
        post.author = {
            _id : user.getBasic().userId,
            displayName : user.displayName,
            avatar : user.getAvatar()
        };
      }
      this.setState({post, hideAuthor});
  }

  componentDidMount(){
    const {editing, user, socket} = this.props;
    if(!user || !user.isLogged()){
        this.setState({redirect : '/notfound'});
        return;
    }
    if(editing){
        // if(!user.canThey('editBlogPosts')){
        //     this.setState({redirect : '/notfound'});
        //     return;
        // }
        let data = {
            userData : user.getBasic(),
            postId : editing
        }
        socket.emit(`client > server edit BlogPost get`, data, this.updatePost);
    }else{
        if(!user.canThey('writeBlogPosts')){
            this.setState({redirect : '/notfound'});
            return;
        }else{
            this.setState({
                post : this.getDefaultPost(),
                ready : true
            }, () => {
                socket.emit(`client > server get categories`, 'blog', this.updateCategories);
            });
        }
    }
    
  }

  changeUpdate = (e, field) => {
      let {post} = this.state;
      post[field] = e.target.value;
      this.setState({post});
  }

  updateCoverImage = (img) => {
    if(!img || !img.length) return;
    let {post} = this.state;
    post.cover = img[0];
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
    let {post, redirect, ready, showCoverPicker, categories, hideAuthor, tags, errors, showThumbnailPicker} = this.state;

    if(redirect){
        return(
            <Redirect to={redirect} />
        );
    }
    if(!categories.length) ready = false;
    if(!ready) return (<></>);
    
    const {editing, user, socket} = this.props;

    let npcTitle = 'writing a blog post';
    let cancelLink = '/blog';
    if(editing) {
        npcTitle = 'editing a blog post';
        cancelLink = `/blog/${post._id}/${Func.speakingUrl(post.title)}`
    }

    let coverPicker = (<></>);
    if(showCoverPicker) coverPicker = (
        <ImageUpload
        user={user}
        socket={socket}
        uploadPath='/posts'
        submitImage={this.updateCoverImage}
        cancelImage={() => this.setState({showCoverPicker : false})}
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

    let authorComp = (<></>);

    if(!hideAuthor && post.author != undefined){
        authorComp = (
            <div className="npcAuthorCont">
                <div className="npcAcAvt" style={{backgroundImage: `url(${post.author.avatar})`}} />
                <div className="npcAcName">{post.author.displayName}</div>
            </div>
        );
    }

    let errorsComp = {
        title : (<></>),
        subTitle : (<></>),
        content : (<></>),
        cover : (<></>),
        thumbnail: (<></>),
        likes : (<></>),
        views : (<></>),
        featured : (<></>),
        visible : (<></>),
        postDate : (<></>),
        author : (<></>),
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

    return (
      <>
      <div className="newPostCont">
      <div className="mainWrap">
        <div className="npcTitle">{npcTitle}</div>

        <div className="npcInputWrapRow">
            <div className="npcInputWrap">
                <div className="npcInputLabel">title</div>
                <div className="npcInputDesc">the title of this blog post. flex your brain muscles and try to be creative.</div>
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
            <div className="npcInputLabel">cover</div>
                <div className="npcInputDesc">because a picture is worth a thousand words and that would've been too absurd for the title.</div>
            <div className="npcCoverPreview"
            style={{backgroundImage : ((post.cover)?`url(${post.cover})`:undefined)}}
            >
            {
                (!post.cover)?('no cover selected'):('')
            }
            </div>
            <div className="npcHelpers">
                <div className="npcHelpersTop">
                    <div className="btn"
                    onClick={() => this.setState({showCoverPicker : true})}
                    ><i className="pufficon-image" /> <span>choose a cover</span></div>
                </div>
                <div className="npcHelpersWrap">{coverPicker}</div>
            </div>
            
            {errorsComp.cover}
        </div>

        <div className="npcInputWrap">
            <div className="npcInputLabel">content</div>
            <div className="npcInputDesc">this is the meat of your post. the juicier the better.</div>
            <Editor
            user = {user}
            socket = {socket}
            text = {post.content}
            change = {(val) => this.updatePostAttr('content', val)}
            />
            {errorsComp.content}
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

        <div className="npcInputWrapRow">

            <div className="npcInputWrap">
                <div className="npcInputLabel">hide author</div>
                <div className="npcInputDesc">there is no "i" in "team" so don't be that guy.</div>
                <Toggle
                value = {hideAuthor}
                update = {this.toggleHideAuthor}
                />
                {errorsComp.author}
            </div>

            {authorComp}

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

export default NewBlogPost;
