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
    constructor(props) {
        super(props);
        this.divRef = React.createRef();
        this.animate = this.animate.bind(this);
        this.resetAnimationStatus();
        this.state = { translationX: 0, translationY: 0 };
        this.acceptInput = true;
        this.expectedAnimations = -1;
    }

    componentDidMount() {
        if (this.props.cell.isMoving() && !this.animationDone && this.animationRequestId === 0) {
            let xyDiffs = this.computeAnimationTranslation();
            this.animation = new MoveAnimation(xyDiffs[0], xyDiffs[1], 500);
            this.animationRequestId = window.requestAnimationFrame(this.animate);
        }
    }

    render() {
        let styles = {
            gridRow: this.props.cell.row + 1,
            gridColumn: this.props.cell.col + 1,
            transform: 'translate(' + this.state.translationX + 'px,' + this.state.translationY + 'px)'
        };

        let cappedValue = Math.min(2048, this.props.cell.val);
        let classes = `value-cell value-${cappedValue}`;

        return (
            <div className={classes} style={styles} ref={this.divRef} >
                {this.props.cell.val}
            </div>
        );
    }

    animate(time) {
        let deltas = this.animation.getMovementDeltas(time);
        this.setState({ translationX: deltas.xDiff, translationY: deltas.yDiff });

        console.log("animating...");

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
        return [xDelta, yDelta];
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
    }

    generateBackgroundCells(rows, columns) {
        let boxes = [];

        for (let i = 0; i < rows; i++)
            for (let j = 0; j < columns; j++)
                boxes.push(<BackgroundCell key={i * columns + j} row={i} col={j} />);

        return boxes;
    }

    handleAnimationDone() {
        console.log("handleAnimationDone()");
        this.expectedAnimations -= 1;

        if (this.expectedAnimations == 0) {
            let newBoard = this.state.board.applyChanges();
            newBoard.spawnCells(1);
            this.acceptInput = true;
            this.setState({ board: newBoard });
        }
    }

    handleKeyDown(keyevent) {

        /**
         * The idea here.
         * 1. Create new board starting from previous one
         * 2. Check for diffs (move returns this if no diff)
         * 3. Render the new cells animating
         * 4. When animations are done
         *  4.1 Apply changes to the board
         *  4.2 Spawn new cell(s) if possible
         *  4.3 Render again new cell(s) animation
         * 5. Check if won/lost maybe?
         * 6. Accept user input again (should be blocked from pt 3 to pt 5)
         */

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
            console.log(this.expectedAnimations);
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