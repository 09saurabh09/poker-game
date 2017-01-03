import React from 'react';
import * as userApi from '../../../../api/user-api';
import * as widgetApi from '../../../../api/widget-api';
import { loadSearchLayout } from '../../../../actions/search-layout-actions';
import SearchForm from '../../../views/search-form';

import CashGameTable from '../../../views/poker-table/cash-game'

export default class CashGameContainer extends React.Component{

  constructor(props) {
    super(props);
  }

  componentDidMount() {
   
  }

  render() {
    let tableData = [{
     name: 'Amar',
     blinds: '$441',
     buyIn: '$50/$200',
     players: '2/9',
     action: 'hot',
     join: true
    },
    {
     name: 'Amar',
     blinds: '$441',
     buyIn: '$50/$200',
     players: '2/9',
     action: 'hot',
     join: false
    },
    {
     name: 'Amar',
     blinds: '$441',
     buyIn: '$50/$200',
     players: '2/9',
     action: 'cold',
     join: true
    }];
    return (
      <CashGameTable tableContents={tableData} />
    );
  }
}
