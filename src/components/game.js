import React from 'react';
import Board from './board';
import { Button, Dropdown, Ref } from 'semantic-ui-react';
import Storage from '../storage/storage';

class Header extends React.Component {
    render() {
        return (
            <>
                <div className="header-line-1">
                    <div className="game-title">2048</div>
                    <ScoreDisplay title="Current" bgcolor="#21ba45" value={this.props.currentScore} />
                    <ScoreDisplay title="Top Score" bgcolor="#2185d0" value={this.props.topScore} />
                </div>
                <div className="header-line-2">
                    <div className="game-exp">Use arrow keys to slide the tiles.</div>
                    <GridSizeSelector options={this.props.options} onGridSizeChanged={this.props.onGridSizeChanged} defaultGridSize={this.props.defaultGridSize} />
                    <NewGameButton onNewGameClicked={this.props.onNewGameClicked} />
                </div>
            </>
        );
    }
}

class GridSizeSelector extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.myRef = React.createRef();
    }

    onChange(event, data) {
        this.myRef.current.blur();
        this.props.onGridSizeChanged(parseInt(data.value));
    }

    render() {
        return (
            <Ref innerRef={this.myRef}>
                <Dropdown
                    style={{margin: 0}}
                    text='Grid Size'
                    icon='grid layout'
                    labeled
                    floating
                    button
                    className='icon'
                    options={this.props.options}
                    defaultValue={this.props.defaultGridSize}
                    onChange={this.onChange}
                    closeOnBlur={true}
                />
            </Ref>
        );
    }
}

class NewGameButton extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        event.target.blur();
        this.props.onNewGameClicked();
    }

    render() {
        return (
            <Button style={{margin: 0}} color="teal" onClick={this.onClick}>New Game</Button>
        );
    }
}

class ScoreDisplay extends React.Component {
    render() {
        return (
            <div style={{backgroundColor: this.props.bgcolor}} className="score-container">
                <div className="score-title">
                    {this.props.title}
                </div>
                <div className="score-value">
                    <p key={this.props.value}> 
                        {this.props.value} 
                    </p>
                </div>
            </div>
        );
    }
}

class Game extends React.Component {

    static DEFAULT_ROWS = 4;
    static DEFAULT_COLS = 4;

    constructor(props) {
        super();
        this.state = {
            rows: Game.DEFAULT_ROWS,
            columns: Game.DEFAULT_COLS,
            currentScore: 0
        };
        this.gridOptions = []
        for (let i = 4; i <= 8; i++)
            this.gridOptions.push({ key: i, text: i.toString() + " x " + i.toString(), value: i });

        this.handleGridResize = this.handleGridResize.bind(this);
        this.handleNewGameClicked = this.handleNewGameClicked.bind(this);
        this.setNewGameHandler = this.setNewGameHandler.bind(this);
        this.handleMoveDone = this.handleMoveDone.bind(this);

        this.storage = new Storage();
    }

    handleGridResize(newSize) {
        this.setState({
            rows: newSize,
            columns: newSize,
            currentScore: 0
        });
    }

    setNewGameHandler(handler) {
        this.newGameHandler = handler;
    }

    handleNewGameClicked() {
        if (this.newGameHandler)
            this.newGameHandler();
        this.setState({currentScore: 0});
    }

    handleMoveDone(moveScore) {
        console.log(moveScore);
        console.log(this.state)
        if(moveScore === 0)
            return;
        
        const newScore = this.state.currentScore + moveScore;
        const bestScore = this.storage.getHighestScore(this.state.rows);
        if(newScore > bestScore)
            this.storage.setHighestScore(this.state.rows, newScore);
        this.setState({currentScore: newScore});
    }

    render() {
        return (
            <div className="gamecontainer">
                <Header 
                    options={this.gridOptions} 
                    defaultGridSize={this.gridOptions[0].value} 
                    onGridSizeChanged={this.handleGridResize} 
                    onNewGameClicked={this.handleNewGameClicked} 
                    currentScore={this.state.currentScore}
                    topScore={this.storage.getHighestScore(this.state.rows)}
                />
                <Board 
                    key={this.state.rows * this.state.columns} 
                    rows={this.state.rows} columns={this.state.columns} 
                    registerResetCallback={this.setNewGameHandler} 
                    onMoveDone={this.handleMoveDone}
                />
                <div className="footer">
                    Game developed by Matteo Bernabito.<br/>
                    Take a look at the source on my <a href="https://github.com/berna1995/my-2048">Github</a>.
                </div>
            </div>
        );
    }
}

export { Game as default };