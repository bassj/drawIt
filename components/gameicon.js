import React from 'react';

class GameIcon extends React.Component {
    render() {
        return (<div className="gameIcon" style={{backgroundColor: "white"}}>
            <span>Name: {this.props.name}</span>
            <span>Players: {this.props.players}/{this.props.maxPlayers}</span>
            <span>Password: {this.props.password? 'yes':'no'}</span>
        </div>);
    }
}

export default GameIcon;