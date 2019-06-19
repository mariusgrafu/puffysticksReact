import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ContextMenuComp from './ContextMenuComp';

function contextMenu(e, options){
    
    let wrapper = document.body.appendChild(document.createElement('div'));
    let thisKey = Math.random();
    let comp = ReactDOM.render(
    <ContextMenuComp key={thisKey} wrapper={wrapper} event={e} options = {options}/>
    , wrapper);

};

export default contextMenu;