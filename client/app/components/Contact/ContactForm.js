import React, { Component } from 'react';

import { Link, Redirect } from 'react-router-dom';
import Editor from '../Helpers/Editor';

class ContactForm extends Component {

  constructor(props){
    super(props);

    this.state = {
        title : ``,
        content : ``,
        budget : ``,
        types : [
          {
            title : 'Logo Design',
            value : 'Logo Design',
            selected : false
          },
          {
            title : 'Branding (Logo and/or Banners)',
            value : 'Branding',
            selected : false
          },
          {
            title : 'IPB Skin',
            value : 'IPB Skin',
            selected : false
          },
          {
            title : 'Webdesign',
            value : 'Webdesign',
            selected : false
          },
          {
            title : 'Other',
            value : 'Other',
            selected : false
          }
        ],
        typesString : ``,
        errors : {
          title : ``,
          budget : ``,
          type : ``,
          content : ``
        },
        redirect : ``
    };
  }

  clearErrors = () => {
    this.setState({
      errors : {
        title : ``,
        budget : ``,
        type : ``,
        content : ``
      }
    });
  }

  updateTitle = (e) => {
      this.setState({title : e.target.value});
  }

  updateBudget = (e) => {
      this.setState({budget : parseFloat(e.target.value) || ''});
  }

  updateOtherTypeValue = (e, index) => {
      let {types} = this.state;
      types[index].value = e.target.value;
      this.setState({types}, this.processTypesString);
  }

  updateContent = (val) => {
      this.setState({content : val});
  }

  processTypesString = () => {
    let {types} = this.state;
    let selectedTypes = types.reduce((acc, type) => {
      if(type.selected) {
        acc.push(type.value);
      }
      return acc;
    }, []);
    let typesString = ``;

    if(selectedTypes.length) {
      let lastType = selectedTypes.pop();
      if(selectedTypes.length) {
        typesString = selectedTypes.join(`<span class="typesSep">, </span>`);
        if(lastType) typesString += `<span class="typesSep"> & </span>`;
      }
      if(lastType) typesString += lastType;
    }

    this.setState({typesString});
  }

  toggleType = (index) => {
    let {types} = this.state;
    try{
      types[index].selected = !types[index].selected;
      this.setState({types}, this.processTypesString);
    }catch (e) {
      console.error(e);
    }
  }

  serverResponse = (res) => {
    if(res.success) {
      this.setState({redirect : res.id});
      return;
    }
    this.setState({errors: res.errors});
  }

  submitMessage = () => {
    const {socket, user} = this.props;
    this.clearErrors();
    let {title, content, budget, typesString} = this.state;
    let data = {
      userData : user.getBasic(),
      title, content, budget,
      type : typesString
    }
    socket.emit(`client > server add new ContactMessage`, data, this.serverResponse);
  }

  render() {
    const {user, socket, closeForm} = this.props;
    const {title, content, budget, types, typesString, errors, redirect} = this.state;

    if(redirect) {
      return (
        <Redirect to={`/contact/${redirect}`} />
      );
    }

    let projectTypesOptionsComp = [];
    let otherTypesInput = (<></>);

    let errorsComps = {};

    for(let k in errors) {
      if(errors[k]) {
          errorsComps[k] = (
          <div className="contactFormError">{errors[k]}</div>
        );
      }
    }

    types.map( (type, i) => {
      let selected = '';
      if(type.selected) {
        selected = ' selected';
        if(type.title == 'Other') {
          otherTypesInput = (
            <input className="contactFormOtherTypeInput" type="text" onChange={(e) => this.updateOtherTypeValue(e, i)} value={types[i].value} />
          );
        }
      }
      projectTypesOptionsComp.push(
        <div className={`contactFormProjectTypesOption${selected}`} onClick={() => this.toggleType(i)} key={i}>
          {type.title}
        </div>
      );
    });

    let typesStringComp = (<></>);

    if(typesString) {
      typesStringComp = (
        <div className="contactFormProjectTypesString"
        dangerouslySetInnerHTML = {{__html : typesString}}
        ></div>
      );
    }

    return (
      <div className="contactFormWrap">
      <div className="contactFormTop">
        <div className="contactFormTitle">contact us</div>
        <div className="contactFormBtn">
            <div className="btn" onClick={closeForm} >go back</div>
        </div>
      </div>

      <div className="contactFormForm">

        <div className="contactFormInputCont">
            <div className="contactFormInputTitle">title</div>
            <div className="contactFormInputDesc">try and give your message a title. 
            don't know what to call it? well let's say you may want a logo.. 
            so call it "i want a logo" (it's that simple). or let's say you 
            want to leave some feedback and tell us how much we suck, so name it "you're awesome" 
            to trick us into actually reading it!</div>
            <input className="contactFormTitleInput" type="text" onChange={this.updateTitle} value={title} />
            {errorsComps['title']}
        </div>

        <div className="contactFormInputCont">
            <div className="contactFormInputTitle">budget</div>
            <div className="contactFormInputDesc">tell us how much are you willing to invest in the project (sum is in euros) 
            or leave empty if you don't have yet one in mind</div>
            <div className="contactFormBudgetWrap">
              <input type="number" min={1} onChange={this.updateBudget} value={budget} />
              <span>€</span>
            </div>
            {errorsComps['budget']}
        </div>

        <div className="contactFormInputCont">
            <div className="contactFormInputTitle">project type</div>
            <div className="contactFormInputDesc">what kind of project do you have in mind? pick from our options or 
            select "other" and tell us what you have in mind. don't go yet too much into detail, that's what "description" down below is for</div>
            <div className="contactFormProjectTypesOptions noSelect">
              {projectTypesOptionsComp}
            </div>
            {otherTypesInput}
            {typesStringComp}
            {errorsComps['type']}
        </div>

        <div className="contactFormInputCont">
            <div className="contactFormInputTitle">description</div>
            <div className="contactFormInputDesc">leave us a detailed description of the project you have in mind and we will 
            try to get back to you asap! pinky swear 🤙</div>
            <Editor
            user = {user}
            socket = {socket}
            text = {content}
            change = {this.updateContent}
            />
            {errorsComps['content']}
        </div>

        <div className="contactFormBtns">
            <div className="btn primary" onClick={this.submitMessage}>submit</div>
        </div>

      </div>

      </div>
    );
  }
}

export default ContactForm;
