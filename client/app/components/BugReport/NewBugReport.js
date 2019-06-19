import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import ImageUpload from '../Helpers/ImageUpload';
import Func from '../Classes/Func';
import Dropdown from '../Helpers/Dropdown';
import Toggle from '../Helpers/Toggle';
import Editor from '../Helpers/Editor';

import queryString from 'query-string';
import { isNullOrUndefined } from 'util';

class NewBugReport extends TabPage {

  constructor(props){
    super(props);

    this.state = {
        post : {},
        redirect : null,
        ready: false,
        categories : [],
        errors : {
            title : [],
            author : [],
            goodieId : [],
            categories : [],
            description : []
        }
    }
  }

  resetErrors = () => {
      let errors = {
        title : [],
        author : [],
        goodieId : [],
        categories : [],
        description : []
    };
    this.setState({errors});
  }

  getDefaultPost = () => {
      const {user} = this.props;
      const {goodieId} = this.props.match.params;
      return {
        title : '',
        author : user.getBasic().userId,
        goodieId,
        description : ''
      };
  }

  submitResponse = (data) => {
      if(!data.success){
          this.setState({errors : data.errors});
          return;
      }else{
          if(data._id){
            this.setState({redirect : `/support/${data._id}`});
            return;
          }
      }
  }

  submit = () => {
      this.resetErrors();
      let {post} = this.state;
      let cPost = $.extend(true,{}, post);
      const {user, socket} = this.props;
      const {goodieId} = this.props.match.params;
      const {categories} = this.state;
      let selectedGoodie = goodieId;
      for(let i = 0; i < categories.length; ++i){
          if(categories[i].selected) {
              selectedGoodie = categories[i].key;
              break;
            }
      }
      cPost.goodieId = selectedGoodie;
      
      socket.emit(`client > server add new bugReport`, {
        userData : user.getBasic(),
        post : cPost
      }, this.submitResponse);

  }

  updateCategories = (cats) => {
      let categories = [{
          title : "puffysticks website",
          key : undefined,
          selected : true
      }];
    for(let i = 0; i < cats.length; ++i){
        categories.push({
            title : cats[i].title,
            key : cats[i]._id,
            selected : false
        })
    }
      this.setState({categories, ready : true});
  }

  componentDidMount(){
    const {user, socket} = this.props;
    const {goodieId} = this.props.match.params;
    if(!user || !user.isLogged()){
        this.setState({redirect : '/notfound'});
        return;
    }
    let ready = false;
    if(goodieId) {
        ready = true;
    }else {
        socket.emit(`client > server get bugreport goodies`, this.updateCategories);
    }
    let post = this.getDefaultPost();
    
    this.setState({post, ready});
  }

  changeUpdate = (e, field) => {
      let {post} = this.state;
      post[field] = e.target.value;
      this.setState({post});
  }

  updatePostAttr = (attr, val) => {
      let {post} = this.state;
      post[attr] = val;
      this.setState({post});
  }

  render() {
    const {socket, user} = this.props;
    const {goodieId} = this.props.match.params;
    let {post, redirect, ready, categories, errors} = this.state;
    
    if(redirect){
        return(
            <Redirect to={redirect} />
        );
    }

    if(!ready) return(<></>);

    let catSelectComp = (<></>);

    
    let errorsComp = {
        title : (<></>),
        author : (<></>),
        goodieId : (<></>),
        categories : (<></>),
        description : (<></>)
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
    
    if(categories.length){
        catSelectComp = (
            <div className="npcInputWrap">
            <div className="npcInputLabel">category</div>
            <div className="npcInputDesc">where did this problem occur?</div>
            <Dropdown
            options = {categories}
            update = {(categories) => this.setState({categories})}
            multiple = {false}
            neverEmpty = {true}
            />
            {errorsComp.categories}
            </div>
        );
    }

    let cancelLink = '/';
    if(goodieId) cancelLink = `/goodies/${goodieId}/-`;

    return (
      <>
        <div className="newPostCont">
        <div className="mainWrap">
            <div className="npcTitle">support</div>

            <div className="npcInputWrapRow">
                <div className="npcInputWrap">
                    <div className="npcInputLabel">title</div>
                    <div className="npcInputDesc">give this report a descriptive title.</div>
                    <input type="text"
                    onChange={(e) => this.changeUpdate(e, 'title')}
                    value={post.title}
                    placeholder={`you won't believe what happened! click to find out!`}
                    />
                    {errorsComp.title}
                </div>
            </div>
            {catSelectComp}
            <div className="npcInputWrap">
                <div className="npcInputLabel">description</div>
                <div className="npcInputDesc">describe the problem here.</div>
                <Editor
                user = {user}
                socket = {socket}
                text = {post.description}
                change = {(val) => this.updatePostAttr('description', val)}
                />
                {errorsComp.description}
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

export default NewBugReport;
