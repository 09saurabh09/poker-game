import React from 'react';
import { Route, IndexRoute } from 'react-router';

// Layouts
import GameLayout from './components/layouts/game/game-layout';

// Pages
import Loby from './components/containers/loby/loby-container';
import CashGameContainer from './components/containers/game/cash-game/cash-game-container';
import TournamentContainer from './components/containers/game/tournament/tournament-container';

export default (
	<Route>
		<Route path="/" component={Loby} />
		<Route path="cash-game">
			<Route component={GameLayout} >
				<IndexRoute component={CashGameContainer} />
			</Route>
		</Route>
		<Route path="tournament">
			<Route component={GameLayout} >
				<IndexRoute component={TournamentContainer} />
			</Route>
		</Route>
	</Route>
);