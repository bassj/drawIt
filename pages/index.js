import React from 'react';
import fetch from 'isomorphic-fetch';
import '../static/style.css';

import GameIcon from '../components/gameicon';
import Overlay from '../components/overlay';

class Index extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showOverlay: false
        };

        this.showOverlay = this.showOverlay.bind(this);
        this.hideOverlay = this.hideOverlay.bind(this);
    }

    showOverlay() {
        this.setState({
            showOverlay: true
        });
    }

    hideOverlay() {
        this.setState({
            showOverlay: false
        });
    }

   render() {
        return (
            <div>
                <div className="header">
                    <button onClick={this.showOverlay}>
                        Create a Game
                    </button>

                    <button style={{float: "right"}}>
                        Sign In
                    </button>
                    <button style={{float: "right"}}>
                        Sign Up
                    </button>
                </div>
                
                <div className="gameList">
                    
                    {this.state.showOverlay? (<Overlay onClose={this.hideOverlay}/>):null}

                    <div className="innerContainer">
                        {this.props.gameList.map(function (game, i) {
                                return (<GameIcon name={game.name} maxPlayers={game.maxPlayers} players={game.players} password={game.password} key={i}/>);
                        })}
                    </div>
                </div>
            </div>
        );    
    }

    static defaultProps = {
        gameList: []
    }

    static async getInitialProps({ req }) {
        const response = await fetch('http://localhost:3000/gamelist');
        const gameList = await response.json();

        return { gameList };
    }
}

export default Index;