import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class BackgroundBox extends React.Component {
    render() {
        return (
            <div className="bg-block" style={{ gridRow: this.props.row + 1, gridColumn: this.props.col + 1 }} />
        );
    }
}

class ValueBox extends React.Component {
    render() {
        return (
            <div className="value-block" style={{ gridRow: this.props.row + 1, gridColumn: this.props.col + 1 }} >
                {this.props.value}
            </div>
        );
    }
}

class Board extends React.Component {

    constructor(props) {
        super(props);

    }

    generateBackgroundBlocks(rows, columns) {
        let boxes = [];

        for (let i = 0; i < rows; i++)
            for (let j = 0; j < columns; j++)
                boxes.push(<BackgroundBox row={i} col={j} />);

        return boxes;
    }

    render() {
        return (
            <div className="gamegrid">
                {this.generateBackgroundBlocks(this.props.rows, this.props.columns)}
                <ValueBox row={1} col={2} value={2048} />
            </div>
        );
    }
}

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

// ========================================

ReactDOM.render(
    <Game rows={4} columns={4} />,
    document.getElementById('root')
);