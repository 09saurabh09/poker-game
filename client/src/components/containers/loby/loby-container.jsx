import React from 'react';
import { Link } from 'react-router';

import Login from '../../views/login/login';

var PlayIcon = require('babel!svg-react!../../../../assets/img/loby/svg/yoga-play.svg?name=PlayIcon');
var HomePageIcon = require('babel!svg-react!../../../../assets/img/loby/svg/home-page.svg?name=HomePageIcon');
var AnalyticsIcon = require('babel!svg-react!../../../../assets/img/loby/svg/analytics.svg?name=AnalyticsIcon');
var SupportIcon = require('babel!svg-react!../../../../assets/img/loby/svg/support.svg?name=SupportIcon');
var SettingsIcon = require('babel!svg-react!../../../../assets/img/loby/svg/settings.svg?name=SettingsIcon');
var LogoutIcon = require('babel!svg-react!../../../../assets/img/loby/svg/logout.svg?name=LogoutIcon');
var ReviewTouchPointIcon = require('babel!svg-react!../../../../assets/img/loby/svg/review-touch-point.svg?name=ReviewTouchPointIcon');
var VideoOverlayIcon = require('babel!svg-react!../../../../assets/img/loby/svg/video-overlay.svg?name=VideoOverlayIcon');
var RealMoneyIcon = require('babel!svg-react!../../../../assets/img/loby/svg/real-money-icon.svg?name=RealMoneyIcon');
var PlayMoneyIcon = require('babel!svg-react!../../../../assets/img/loby/svg/play-money-icon.svg?name=PlayMoneyIcon');
var SearchIcon = require('babel!svg-react!../../../../assets/img/loby/svg/search-icon.svg?name=SearchIcon');
var CashGameIcon = require('babel!svg-react!../../../../assets/img/loby/svg/cash-games.svg?name=CashGameIcon');
var SitGoIcon = require('babel!svg-react!../../../../assets/img/loby/svg/sit-and-go.svg?name=SitGoIcon');
var TournamentIcon = require('babel!svg-react!../../../../assets/img/loby/svg/tournament.svg?name=TournamentIcon');
var MyTournamentIcon = require('babel!svg-react!../../../../assets/img/loby/svg/my-tournament.svg?name=MyTournamentIcon');

import './loby.scss';

export default class Loby extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="container-fluid loby">
        <Login />
        <div className="row loby-container">
          <aside className="col-lg-1 col-xs-2 aside">
            <div className="icon-bar" style={{minHeight: 1003}}>
                <div className="play-icon">
                  <PlayIcon />
                </div>
                <Link className="home-icone-wrapper" to="/">
                  <div className="active"></div>
                  <div className="home-icon">
                    <HomePageIcon />
                  </div>
                </Link>
                <Link to="/analytics">
                  <AnalyticsIcon />
                </Link>
                <Link to="/support">
                  <SupportIcon />
                </Link>
                <Link to="/settings">
                  <SettingsIcon />
                </Link>
                <a data-toggle="modal" data-target="#login" className="logout-container">
                  <LogoutIcon />
                </a>
            </div>
          </aside>
          <main className="col-lg-11 col-xs-10 main">
            <div className="row">
              <div className="col-lg-6 col-xs-12">
                <div className="row user-container">
                  <div className="col-lg-4 col-xs-12 profile-photo">
                    <img className="photo"/>
                  </div>
                  <div className="col-lg-8 col-xs-12">
                    <div className="row user-details">
                      <div className="col-lg-7 col-xs-6">
                        <div className="user-name">
                          Adeline Daniel
                        </div>
                        <div className="balance">
                          Balance : $6218 
                        </div>
                      </div>
                      <div className="col-lg-5 col-xs-6">
                        <Link to="/review" className="pull-right">
                          <ReviewTouchPointIcon/>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row money-search-container">
                  <div className="row">
                    <div className="col-lg-6 col-xs-6">
                      <div className="money">
                        <RealMoneyIcon /> 
                        <span className="text">Real Money:</span> <span className="text value">$784</span>
                      </div>
                    </div>
                    <div className="col-lg-6 col-xs-6">
                      <div className="money">
                        <PlayMoneyIcon />
                        <span className="text">Play Money:</span> <span className="text value"> $784</span>
                      </div>
                    </div>
                  </div>
                  <div className="search-container">
                    <div className="form-group">
                      <input type="text" className="form-control" id="search-input" placeholder="Search tournament, player, table"/>
                      <div className="search-icon">
                        <SearchIcon />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-xs-12 review-section">
                <div className="video-container">
                  <video className="promo-video"></video>
                  <div className="video-overlay">
                    <VideoOverlayIcon />
                  </div>
                </div>
              </div>
            </div>
            <div className="game-type">
              <div className="col-lg-6 col-xs-12">
                <Link to="/cash-game" className="cash-game">
                  <div className="game">
                    <div className="col-lg-5 col-xs-5">
                      <div className="cash-game-icon-container">
                        <CashGameIcon />
                      </div>
                    </div>
                    <div className="col-lg-7 col-xs-7">
                      <div className="game-box">
                        <div className="game-title">
                          Cash Games
                        </div>
                        <div className="play-with-friends">
                          Play with your friends
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-lg-6 col-xs-12">
                <Link to="/tournament" className="tournament">
                  <div className="game">
                    <div className="col-lg-5 col-xs-5">
                      <div className="tournament-icon-container">
                        <TournamentIcon />
                      </div>
                    </div>
                    <div className="col-lg-7 col-xs-7">
                      <div className="game-box">
                        <div className="game-title">
                          Tournament
                        </div>
                        <div className="play-with-friends">
                          Play with your friends
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            <div className="">
              <div className="col-lg-6 col-xs-12">
                <Link to="/sit-and-go" className="sit-and-go">
                  <div className="game">
                    <div className="col-lg-5 col-xs-5">
                      <div className="sit-go-game-icon-container">
                        <SitGoIcon />
                      </div>
                    </div>
                    <div className="col-lg-7 col-xs-7">
                      <div className="game-box">
                        <div className="game-title">
                          Sit and Go
                        </div>
                        <div className="play-with-friends">
                          Play with your friends
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-lg-6 col-xs-12">
                <Link to="/my-tournament" className="my-tournamet">
                  <div className="game">
                    <div className="col-lg-5 col-xs-5">
                      <div className="my-tournament-icon-container">
                        <MyTournamentIcon />
                      </div>
                    </div>
                    <div className="col-lg-7 col-xs-7">
                      <div className="game-box">
                        <div className="game-title">
                          My Tournament
                        </div>
                        <div className="play-with-friends">
                          Play with your friends
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }
}