import React from 'react';
import Board from './board'

class Header extends React.Component {
    render() {
        return (
            <div className="header">
                <h1> My-2048 </h1>
            </div>
        );
    }
}

class Game extends React.Component {
    render() {
        return (
            <div className="gamecontainer">
                <Header />
                <Board rows={this.props.rows} columns={this.props.columns} />
            </div>
        );
    }
}

export { Game as default };