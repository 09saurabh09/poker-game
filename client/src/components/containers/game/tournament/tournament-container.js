import React from 'react';
import * as userApi from '../../../../api/user-api';
import * as widgetApi from '../../../../api/widget-api';
import { loadSearchLayout } from '../../../../actions/search-layout-actions';
import SearchForm from '../../../views/search-form';

import TournamentTable from '../../../views/poker-table/tournament'

export default class CashGameContainer extends React.Component{

  constructor(props) {
    super(props);
  }

  componentDidMount() {
   
  }

  render() {
    let tableData = [{
     name: 'Amar',
     buyIn: '$50/$200',
     enrolled: '2/9',
     startTime: '18 Jun 11:31AM',
     join: true
    },
    {
     name: 'Amar',
     buyIn: '$50/$200',
     enrolled: '2/9',
     startTime: '18 Jun 11:31AM',
     join: false
    },
    {
     name: 'Amar',
     buyIn: '$50/$200',
     enrolled: '2/9',
     startTime: '18 Jun 11:31AM',
     join: true
    }];
    return (
      <TournamentTable tableContents={tableData} />
    );
  }
}
