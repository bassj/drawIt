import React from 'react';

import GameForm from '../components/gameform';

class Overlay extends React.Component {
    render() {
        return (
        <div className="overlay">
            <div className="overlay-window">
                <div className="overlay-header">
                    <button onClick={this.props.onClose} style={{float: "right"}}>
                        X
                    </button>
                </div>
                <div className="overlay-body">
                    <GameForm />
                </div>
            </div>
        </div>);  
    }
}

export default Overlay;