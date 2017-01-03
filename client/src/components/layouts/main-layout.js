import React from 'react';
import { Link } from 'react-router';

// Using "Stateless Functional Components"
export default function(props) {
  return (
    <div className="app">
      <header className="primary-header"></header>
      <div>
        <div className="ui visible inverted left labeled icon vertical sidebar menu">
          <a className="item">
              <i className="home icon"></i>
          </a>
          <a className="item">
              <i className="block layout icon"></i>
          </a>
          <a className="item">
              <i className="smile icon"></i>
          </a>
          <a className="item">
              <i className="calendar icon"></i>
          </a>
          <a className="item">
              <i className="settings icon"></i>
          </a>
      </div>
        <div className="pusher">
          {props.children}
        </div>
      </div>
    </div>
    );
}
