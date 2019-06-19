import React from 'react';
import { Link } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';

class OfflineSite extends TabPage {
    constructor(props) {
        super(props);
    }

  render(){
    const {user} = this.props;
    let btn = (<Link to="/login" className="btn primary">login</Link>);

    if(user.isLogged()) {
        btn = (<div className="btn primary" onClick={user.logout}>logout</div>);
    }
    return (<>

    <div className="offlineSiteWrap">
        <div className="mainWrap">
            <div className="offlineSiteImg noSelect">
                <img src="../../assets/img/offline/offlineSite.svg" />
            </div>
            <div className="offlineSiteText">
                <h2>puffysticks is currently offline. check back later!</h2>
                {btn}
            </div>
        </div>
    </div>

    </>
    );
  }
  
}

export default OfflineSite;
