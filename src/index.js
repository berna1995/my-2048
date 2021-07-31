import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { GameBoard, MoveDirection, Cell } from './logic';
import { MoveAnimation } from './animation_helper';

class BackgroundCell extends React.Component {
    render() {
        return (
            <div className="bg-cell" style={{ gridRow: this.props.row + 1, gridColumn: this.props.col + 1 }} />
        );
    }
}

class ValueCell extends React.Component {

    static TRANSLATION_1_CELL_DURATION = 150;

    constructor(props) {
        super(props);
        this.divRef = React.createRef();
        this.animate = this.animate.bind(this);
        this.resetAnimationStatus();
        this.state = { translationX: 0, translationY: 0 };
    }

    render() {
        let styles = {
            gridRow: this.props.cell.row + 1,
            gridColumn: this.props.cell.col + 1,
        };

        if(this.props.cell.isMoving()) {
            styles['transform'] = 'translate(' + this.state.translationX + 'px,' + this.state.translationY + 'px)';
        }

        let cappedValue = Math.min(2048, this.props.cell.val);
        let zIndexClass = this.props.cell.isGettingMerged() ? 'value-cell-merged' : 'value-cell-top';
        let classes = `value-cell value-${cappedValue} ${zIndexClass}`;

        return (
            <div className={classes} style={styles} ref={this.divRef} >
                {this.props.cell.val}
            </div>
        );
    }

    componentDidUpdate(prevProps) {
        if(prevProps.cell.isMoving() && !this.props.cell.isMoving())
            this.resetAnimationStatus();

        if (this.props.cell.isMoving() && !this.animationDone && this.animationRequestId === 0) {
            let [xDiff, yDiff, animDuration] = this.computeAnimationTranslation();
            this.animation = new MoveAnimation(xDiff, yDiff, animDuration);
            this.animationRequestId = window.requestAnimationFrame(this.animate);
        }
    }

    animate(time) {
        let deltas = this.animation.getMovementDeltas(time);
        this.setState({ translationX: deltas.xDiff, translationY: deltas.yDiff });

        if (!this.animation.isDone())
            this.animationRequestId = window.requestAnimationFrame(this.animate);
        else {
            this.animation = null;
            this.animationDone = true;
            this.animationRequestId = 0;
            this.props.animationDoneCallback();
        }
    }

    componentWillUnmount() {
        if (this.animationRequestId !== 0)
            window.cancelAnimationFrame(this.animationRequestId);
    }

    computeAnimationTranslation() {
        let xCellsDelta = this.props.cell.colDestination - this.props.cell.col;
        let yCellsDelta = this.props.cell.rowDestination - this.props.cell.row;
        let borderPx = Number.parseInt(getComputedStyle(this.divRef.current).getPropertyValue('--grid-border').trim().replace("px", ""));
        let boundingBox = this.divRef.current.getBoundingClientRect();
        let cellWidth = boundingBox.width;
        let cellHeight = boundingBox.height;
        let xDelta = (xCellsDelta * cellWidth) + (borderPx * xCellsDelta);
        let yDelta = (yCellsDelta * cellHeight) + (borderPx * yCellsDelta);
        let animDuration = Math.max(Math.abs(xCellsDelta), Math.abs(yCellsDelta)) * ValueCell.TRANSLATION_1_CELL_DURATION;
        return [xDelta, yDelta, animDuration];
    }

    resetAnimationStatus() {
        this.animation = null;
        this.animationDone = false;
        this.animationRequestId = 0;
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleAnimationDone = this.handleAnimationDone.bind(this);

        let gameBoard = new GameBoard(props.rows, props.columns);
        gameBoard.spawnCells(1);

        this.state = { board: gameBoard };
        this.acceptInput = true;
        this.expectedAnimations = -1;
    }

    generateBackgroundCells(rows, columns) {
        let boxes = [];

        for (let i = 0; i < rows; i++)
            for (let j = 0; j < columns; j++)
                boxes.push(<BackgroundCell key={i * columns + j} row={i} col={j} />);

        return boxes;
    }

    handleAnimationDone() {
        this.expectedAnimations -= 1;

        if (this.expectedAnimations === 0) {
            let newBoard = this.state.board.applyMoves();
            newBoard.spawnCells(1);
            this.acceptInput = true;
            this.setState({ board: newBoard });
        }
    }

    handleKeyDown(keyevent) {
        if (!this.acceptInput)
            return;

        let oldBoard = this.state.board;
        let newBoard;
        let moveDir;

        switch (keyevent.keyCode) {
            case 40: moveDir = MoveDirection.DOWN; break;
            case 39: moveDir = MoveDirection.RIGHT; break;
            case 38: moveDir = MoveDirection.UP; break;
            case 37: moveDir = MoveDirection.LEFT; break;
            default: return;
        }

        newBoard = oldBoard.move(moveDir);
        if (newBoard !== oldBoard) {
            this.acceptInput = false;
            this.expectedAnimations = newBoard.cells.flat().reduce((acc, cell) => acc + (cell.isMoving() ? 1 : 0), 0);
            this.setState({ board: newBoard });
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
        const nonEmptyCells = this.state.board.getNonEmptyCells();
        const valueCells = nonEmptyCells.map((c) => {
            return <ValueCell key={c.cellIdentifier} cell={c} animationDoneCallback={this.handleAnimationDone} />
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