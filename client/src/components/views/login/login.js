import React from 'react';
import './login.scss';

var PlayIcon = require('babel!svg-react!../../../../assets/img/loby/svg/yoga-play.svg?name=PlayIcon');
var LoginIcon = require('babel!svg-react!../../../../assets/img/loby/svg/login-button.svg?name=LoginIcon');

export default class Login extends React.Component {
	constructor(props) {
			super(props);
      this.login = this.login.bind(this);
	}

  login() {
    alert('login');
  }

	render() {
		return (
			<div className="modal fade-scale" id="login" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div className="vertical-alignment-helper">
            <div className="modal-dialog vertical-align-center">
                <div id="login-content" className="modal-content">
                    <div className="modal-body">
                      <div className="modal-container">
                        <div className="play-icon-container"><PlayIcon /></div>
                        <form className="form-horizontal form-container">
                          <div className="form-group">
                            <label htmlFor="inputUsername" className="sr-only">User name</label>
                            <div className="col-lg-8 col-lg-offset-2 col-sm-10 col-sm-offset-1">
                              <input autoComplete="off" type="email" className="form-control" id="inputUsername" placeholder="User name" />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="inputPassword" className="sr-only">Password</label>
                            <div className="col-lg-8 col-lg-offset-2 col-sm-10 col-sm-offset-1">
                              <input type="password" className="form-control" id="inputPassword" placeholder="Password" />
                              <div className="login-button">
                                <LoginIcon onClick={this.login}/>  
                              </div>
                            </div>
                          </div>
                          <div className="form-group">
                            <div className="col-lg-8 col-lg-offset-2 col-sm-10 col-sm-offset-1">
                              <div className="row bottom-button-container">
                                <div className="col-lg-6">
                                  <button id="sign-up" type="button" className="btn btn-block" data-dismiss="modal">Sign up</button>  
                                </div>
                                <div className="col-lg-6">
                                  <button id="facebook-login" type="button" className="btn btn-block">Facebook login</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
		)
	}
}