import React, { Component } from 'react';
import Func from '../../Classes/Func';

import {
    Link,
    Redirect
  } from 'react-router-dom';

import Report from './Report';

class Reports extends Component {

  constructor(props){
    super(props);

    this.state = {
      reports : null
    }
  }

  updateReports = (reports) => {
      this.setState({reports});
  }

  refreshReports = () => {
      const {socket} = this.props;

      socket.emit(`client > server get reports`, this.updateReports);
  }

  componentDidMount() {
      const {socket} = this.props;
      this.refreshReports();

      socket.on(`server > client refresh reports`, this.refreshReports);
  }

  render() {
    const {socket, user} = this.props;
    const {reports} = this.state;

    let reportsComps = (<></>);

    if(!reports) return (<></>);

    if(reports && reports.length) {
        reportsComps = (
            reports.map( (report, i) => {
                return (
                    <Report
                    key = {`${i}.${Math.random()}`}
                    report = {report}
                    user = {user}
                    socket = {socket}
                    />
                );
            })
        );
    }

    return (
      <>
      <div className="mainWrap adminPageReports">
        {reportsComps}
      </div>
      </>
    );
  }
}

export default Reports;
