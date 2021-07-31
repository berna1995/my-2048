import React from 'react';
import ReactDOM from 'react-dom';
import Game from './components/game'
import './css/index.css';

ReactDOM.render(
    <Game rows={4} columns={4} />,
    document.getElementById('root')
);