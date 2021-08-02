import React from 'react';
import Board from './board'

class Header extends React.Component {
    render() {
        return (
            <>
                <div className="header-line-1">
                    <h1> 2048 </h1>
                </div>
                <div className="header-line-2">
                    <GridSizeSelector options={this.props.options} onGridSizeChanged={this.props.onGridSizeChanged} />
                    <NewGameButton onNewGameClicked={this.props.onNewGameClicked}/>
                </div>
            </>
        );
    }
}

class GridSizeSelector extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    getOptions() {
        let options = [];
        this.props.options.forEach(opt => {
            const optString = `${opt} x ${opt}`;
            options.push(<option key={opt} value={opt}>{optString}</option>)
        });
        return options;
    }

    onChange(event) {
        event.target.blur();
        this.props.onGridSizeChanged(parseInt(event.target.value));
    }

    render() {
        return (
            <form action="#">
                <label htmlFor="sizeselector">Grid size: </label>
                <select id="sizeselector" onChange={this.onChange}>
                    {this.getOptions()}
                </select>
            </form>
        );
    }
}

class NewGameButton extends React.Component {
    render() {
        return (
            <button className="new-game-btn" onClick={this.props.onNewGameClicked}>New Game</button>
        );
    }
}

class Footer extends React.Component {
    render() {
        const lines = this.props.lines.map(line => <> <span>{line}</span> <br></br> </>)

        return (
            <div className="footer">{lines}</div>
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
            columns: Game.DEFAULT_COLS
        };
        this.gridOptions = []
        for (let i = 4; i <= 8; i++)
            this.gridOptions.push(i);

        this.handleGridResize = this.handleGridResize.bind(this);
        this.handleNewGameClicked = this.handleNewGameClicked.bind(this);
        this.setNewGameHandler = this.setNewGameHandler.bind(this);
    }

    handleGridResize(newSize) {
        this.setState({
            rows: newSize,
            columns: newSize
        });
    }

    setNewGameHandler(handler) {
        this.newGameHandler = handler;
    }

    handleNewGameClicked() {
        if(this.newGameHandler)
            this.newGameHandler();
    }

    render() {
        return (
            <div className="gamecontainer">
                <Header options={this.gridOptions} onGridSizeChanged={this.handleGridResize} onNewGameClicked={this.handleNewGameClicked}/>
                <Board key={this.state.rows * this.state.columns} rows={this.state.rows} columns={this.state.columns} registerResetCallback={this.setNewGameHandler}/>
                <Footer lines={["Use arrow keys to slide the tiles.", "Game developed by Matteo Bernabito."]}/>
            </div>
        );
    }
}

export { Game as default };