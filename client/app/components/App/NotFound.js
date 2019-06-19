import React from 'react';
import { Link } from 'react-router-dom';
import TabPage from '../TabPage/TabPage';

class NotFound extends TabPage {

  render(){
    return (<>

    <div className="notFoundWrap">
      <div className="milkCartonContainer">
        <img className="milkCarton" src="../../assets/img/notfound/milkCarton.svg" />
        <img className="milkCartonBG" src="../../assets/img/notfound/milkCartonBG.svg" />
      </div>
      <div className="notFoundText">
        <h2>page not found</h2>
        <Link to="/" className="btn primary">go home</Link>
      </div>
    </div>

    </>
    );
  }
  
}

export default NotFound;
