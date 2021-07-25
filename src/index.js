import React from 'react';
import ReactDOM from 'react-dom';


class Game extends React.Component {
    render() {
        return (
            <div className="gamepanel">
                Game content here
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);