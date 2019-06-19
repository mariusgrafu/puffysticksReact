import React, { Component } from 'react';
import Func from '../Classes/Func';
import { Link } from 'react-router-dom';

class ProfileReports extends Component {

  constructor(props){
    super(props);

    this.state = {
        reports : []
    }
  }

  updateReports = (reports) => {
      this.setState({reports});
  }

  componentDidMount() {
    const {user, socket} = this.props;

    let data = {
        userData : user.getBasic()
    }

    socket.emit(`client > server get user reports`, data, this.updateReports);
  }

  render() {
    const {user, socket} = this.props;
    const {reports} = this.state;

    let reportsComp = (
        <div className="profileSectionSubtitle">there are no reports</div>
    );

    if(reports.length) {
        let reportStates = ['pending', 'completed'];
        reportsComp = (
            <div className="profileReportsCont">
            {
                reports.map( (report, i) => {
                    let reportedPlatform = 'puffysticks website';
                    if(report.goodieId) reportedPlatform = report.goodieId.title;

                    return (
                        <Link to={`/support/${report._id}`} key={i} className="profileReportWrap">
                            <div className="profileReportTitleState">
                                <div className="profileReportTitle">{report.title}</div>
                                <div className="profileReportState">{reportStates[report.state]}</div>
                            </div>
                            <div className="profileReportedOn">
                                reported on <span>{reportedPlatform}</span>
                            </div>
                        </Link>
                    );
                })
            }
            </div>
        );
    }

    return (
      <>
        <div className="profileSectionTitle">my reports</div>
        {reportsComp}
      </>
    );
  }
}

export default ProfileReports;
