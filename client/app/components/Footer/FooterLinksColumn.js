import React from 'react';
import { Link } from 'react-router-dom';

class FooterLinksColumn extends React.Component{

  render(){
    const {links} = this.props;
    return (
        <div className="footerLinksColumn">
            <div className="footerLinksColumnTitle">{this.props.title}</div>
            {
                
            links.map( (link, i) => {
                return(
                    <React.Fragment key = {i}>
                    {
                    (link.address.external)?(
                    <a 
                        href = {link.address.link} 
                        target = "_blank"
                        className = "footerLink"
                        key = {i}
                    >
                        {link.title}
                    </a>
                    ):(
                    <Link 
                        to = {link.address.link} 
                        className = "footerLink"
                        key = {i}
                    >
                        {link.title}
                    </Link>
                    )
                    }
                    </React.Fragment>
                );
            } )
  
            } 
        </div>
    );
  }

} 

export default FooterLinksColumn;
