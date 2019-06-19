import React, { Component } from 'react';
import Func from '../../Classes/Func';

import {
    Link,
    Redirect
  } from 'react-router-dom';

class Report extends Component {

  constructor(props){
    super(props);

    this.state = {
      report : null
    }
  }

  refreshReport = () => {
    const {report} = this.props;
    let cReport= $.extend(true,{}, report);
    this.setState({report : cReport});
  }

  componentDidMount() {
      this.refreshReport();
  }

  deleteReport = () => {
      const {report} = this.state;
      const {user, socket} = this.props;
      let data = {
          userData : user.getBasic(),
          reportId : report._id
      };

      socket.emit(`client > server delete BugReport`, data);
  }

  render() {
    const {report} = this.state;

    if(!report) return (<></>);

    let state = 'pending';
    if(report.state == 1) state = 'completed';

    let reportedOn = (<></>);
    if(report.goodieId != undefined) {
        reportedOn = (<div className="aprrReportedOn">reported on <span>{report.goodieId.title}</span></div>);
    }

    return (
      <>
        <div className="aprReportWrap">
            <div className="aprrTitleState">
                <div className="aprrTitle">{report.title}</div>
                <div className="aprrState">{state}</div>
            </div>
            <div className="aprrStats">
                posted {Func.fullDate(report.postDate)} by {report.author.displayName}
            </div>
            {reportedOn}
            <div className="aprrBtns">
                <Link to={`/support/${report._id}`} className="btn primary">go to report</Link>
                <div className="btn" onClick={this.deleteReport}>delete</div>
            </div>
        </div>
      </>
    );
  }
}

export default Report;
