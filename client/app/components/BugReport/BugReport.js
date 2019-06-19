import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';
import Func from '../Classes/Func';
import CommentCont from '../Comment/CommentCont';
import { Link } from 'react-router-dom';

class BugReport extends TabPage {

  constructor(props){
    super(props);

    this.state = {
      pageId : null,
      redirect : false,
      loading : true,
      report : {}
    };

  }
  
  updatePageId = (pageId) => {
    this.setState({pageId});
  }

  updateReport = (report) => {
    if(!report){
      this.setState({redirect : true});
      return;
    }
    const {socket} = this.props;
    const {pageId} = this.state;

    if(!pageId) socket.emit(`client > server get pageId with key`, 'goodies', this.updatePageId);
    this.setState({report, loading: false});
  }

refreshReport = () => {
  const {id} = this.props.match.params;
  const {socket, user} = this.props;
  
  let data = {
    reportId : id,
    userData : user.getBasic()
  }
  
  socket.emit(`client > server get bugReport`, data, this.updateReport);
}

  componentDidMount(){
    const {id} = this.props.match.params;
    const {socket} = this.props;
    this.refreshReport();

    socket.on(`server > client refresh BugReport ${id}`, () => this.refreshReport());
  }

  changeReportState = (newState) => {
    let {report} = this.state;
    if(report.state == newState) return;
    const {socket, user} = this.props;
    let data = {
      userData : user.getBasic(),
      reportId : report._id,
      newState
    };

    socket.emit(`client > server edit state BugReport`, data);
  }

  render() {
    const {colors, user, socket} = this.props;
    const {report, loading, redirect, pageId} = this.state;

    if(redirect) {
      return (<Redirect to="/notfound" />);
    }

    let CommentComp = (
      <CommentCont
        user={user}
        socket={socket}
        colors={colors}
        postId={report._id}
        pageId={pageId}
        pageKey='support'
      />
    );

    let reportStatus = '';

    switch(report.state) {
      case 0 : 
      reportStatus = `pending`;
      break;
      case 1 : 
      reportStatus = `completed`;
      break;
    }

    let statusComp = (
      <div className="brpStatusCont noSelect">
        <div className="brpStatus">{reportStatus}</div>
      </div>
    );

    if(user.canThey('manageBugReports')) {
      statusComp = (
        <div className="brpStatusCont noSelect">
          <div className={`brpStatus${((report.state == 0)?(' selected'):(''))}`}
          onClick={() => this.changeReportState(0)}
          >pending</div>
          <div className={`brpStatus${((report.state == 1)?(' selected'):(''))}`}
          onClick={() => this.changeReportState(1)}
          >completed</div>
        </div>
      );
    }

    let reportedPlatform = 'puffysticks website';

    if(report.goodieId) reportedPlatform = (
      <Link to={`/goodies/${report.goodieId._id}/${Func.speakingUrl(report.goodieId.title)}`} target="_blank">{report.goodieId.title}</Link>
    );

    if(loading || !pageId) {
      return (<></>);
    }

    return (
      <>
      <div className="bugReportPageCont">
        <div className="mainWrap">
          <div className="brpTitleStatus">
            <div className="brpTitle">{report.title}</div>
            {statusComp}
          </div>
          <div className="brpReportedPlatform">
          reported on <span>{reportedPlatform}</span>
          </div>
          <div className="brpReportAuthor">
            <div className="brpRaAvt" style={{backgroundImage : `url(${report.author.avatar})`}} />
            <div className="brpRepBy">
              <span>reported by</span>
              <div className="brpRaName">{report.author.displayName}</div>
            </div>
          </div>

          <div className="contentText" dangerouslySetInnerHTML={{__html : report.description}} />

          {CommentComp}
        </div>
      </div>
      </>
    );
  }
}

export default BugReport;
