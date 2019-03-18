import React from 'react';
import Spinner from './spinner';
import fetch from 'isomorphic-fetch';

class GameForm extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showPassword: false,
            name: "",
            maxPlayers: 1,
            password: ""
        };

        this.handleShowPassword = this.handleShowPassword.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangeMaxPlayers = this.handleChangeMaxPlayers.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.createGame = this.createGame.bind(this);
    }

    handleShowPassword(event) {
        this.setState({
            showPassword: event.target.checked,
            name: this.state.name,
            maxPlayers: this.state.maxPlayers,
            password: this.state.password
        });
    }

    handleChangeName(event) {
        this.setState({
            showPassword: this.state.showPassword,
            name: event.target.value,
            maxPlayers: this.state.maxPlayers,
            password: this.state.password
        });
    }
    
    handleChangeMaxPlayers(event) {
        this.setState({
            showPassword: this.state.showPassword,
            name: this.state.name,
            maxPlayers: event.value,
            password: this.state.password
        });
    }

    handleChangePassword(event) {
        this.setState({
            showPassword: this.state.showPassword,
            name: this.state.name,
            maxPlayers: this.state.password,
            password: event.target.value
        });
    }

    createGame() {
        fetch('/creategame', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.state)
            }).then(function (response) {
                response.json().then(function (body) {
                    console.log(body);
                });
            });
    }

    render() {
        return (<div> 
            <label>Game Name: </label>
            <input type="text" placeholder="Name" value={this.state.name} onChange={this.handleChangeName}></input>
            <label>Max Players: </label>
            <Spinner value={this.state.maxPlayers} min="2" max="99" onChange={this.handleChangeMaxPlayers} style={{width: "20%"}}></Spinner>
            <label>Has Password?</label>
            <input type="checkbox" onChange={this.handleShowPassword} checked={this.state.showPassword}></input>
            <br />
            {this.state.showPassword? (<input type="password" placeholder="Password" value={this.state.password} onChange={this.handleChangePassword}></input>):null}
            <button onClick={this.createGame}>Create Game</button>
        </div>);
    }
}

export default GameForm;