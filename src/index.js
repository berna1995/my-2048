import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class BackgroundCell extends React.Component {
    render() {
        return (
            <div className="bg-cell" style={{ gridRow: this.props.row + 1, gridColumn: this.props.col + 1 }} />
        );
    }
}

class ValueCell extends React.Component {
    render() {
        return (
            <div className="value-cell" style={{ gridRow: this.props.row + 1, gridColumn: this.props.col + 1 }} >
                {this.props.value}
            </div>
        );
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    generateBackgroundCells(rows, columns) {
        let boxes = [];

        for (let i = 0; i < rows; i++)
            for (let j = 0; j < columns; j++)
                boxes.push(<BackgroundCell key={i*columns + j } row={i} col={j}/>);

        return boxes;
    }

    handleKeyDown(keyevent) {
        this.setState({hello: 10}); 
        switch(keyevent.keyCode) {
            case 40: 
                // Arrow down
                console.log("Arrow down pressed");
                break;
            case 39:
                // Arrow right
                console.log("Arrow right pressed");
                break;
            case 38:
                // Arrow up
                console.log("Arrow up pressed");
                break;
            case 37:
                // Arrow left
                console.log("Arrow left pressed");
                break;
            default: return;
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown);
    }

    render() {
        const bgCells = this.generateBackgroundCells(this.props.rows, this.props.columns);

        return (
            <div className="gamegrid">
                {bgCells}
                <ValueCell row={1} col={2} value={2048} />
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