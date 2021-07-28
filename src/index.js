import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { GameBoard, MoveDirection, Cell } from './logic';

class BackgroundCell extends React.Component {
    render() {
        return (
            <div className="bg-cell" style={{ gridRow: this.props.row + 1, gridColumn: this.props.col + 1 }} />
        );
    }
}

class ValueCell extends React.Component {
    constructor(props) {
        super(props);
        this.divRef = React.createRef();
        this.animate = this.animate.bind(this);
    }

    render() {
        let styles = {
            gridRow: this.props.cell.row + 1,
            gridColumn: this.props.cell.col + 1,
        };

        return (
            <div className="value-cell" style={styles} ref={this.divRef} >
                {this.props.cell.val}
            </div>
        );
    }

    animate(time) {
    }

    componentDidUpdate(prevProps) {
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.state = { board: new GameBoard(props.rows, props.columns) };
    }

    generateBackgroundCells(rows, columns) {
        let boxes = [];

        for (let i = 0; i < rows; i++)
            for (let j = 0; j < columns; j++)
                boxes.push(<BackgroundCell key={i * columns + j} row={i} col={j} />);

        return boxes;
    }

    handleKeyDown(keyevent) {
        let newBoard;

        switch (keyevent.keyCode) {
            case 40: newBoard = this.state.board.move(MoveDirection.DOWN); break;
            case 39: newBoard = this.state.board.move(MoveDirection.RIGHT); break;
            case 38: newBoard = this.state.board.move(MoveDirection.UP); break;
            case 37: newBoard = this.state.board.move(MoveDirection.LEFT); break;
            default: return;
        }

        // For testing purposes only, change this
        newBoard.applyChanges();

        this.setState({ board: newBoard });
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown);
    }

    render() {
        const bgCells = this.generateBackgroundCells(this.props.rows, this.props.columns);
        const valueCells = this.state.board.getNonEmptyCells().map((c) => {
            return <ValueCell key={c.cellIdentifier} cell={c} />
        });

        return (
            <div className="gamegrid">
                {bgCells}
                {valueCells}
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