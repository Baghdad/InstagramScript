import React, { Component } from "react";
import "./App.css";
import axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login: "",
      password: "",
      account: "",
      logged: false,
      error: "",
      accounts: [],
      selected: 0,
      followSuccess: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleCheck(event) {
    const { target } = event;
    const { name, checked: value } = target;

    const { accounts: stateAccounts } = this.state;
    let { selected } = this.state;
    const accounts = stateAccounts.slice();
    const account = accounts.find(account => account.id.toString() === name);
    account.follow = value;
    if (value) {
      selected += 1;
    } else {
      selected -= 1;
    }

    this.setState({
      accounts,
      selected,
      followSuccess: false
    });
  }

  handleSubmit(event) {
    const target = event.target;
    const name = target.name;
    if (name === "login") {
      axios
        .post("http://localhost:1337/login", {
          login: this.state.login,
          password: this.state.password
        })
        .then(response => {
          if (response.data === "OK") {
            this.setState({
              logged: true,
              error: ""
            });
          } else {
            this.setState({
              error: response.data
            });
          }
          this.setState({
            password: ""
          });
        })
        .catch(error => {
          this.setState({
            error
          });
        });
    } else if (name === "logoff") {
      axios
        .get("http://localhost:1337/logoff")
        .then(response => {
          if (response.data === "OK") {
            this.setState({
              logged: false,
              error: ""
            });
          } else {
            this.setState({
              error: response.data
            });
          }
          this.setState({
            account: "",
            accounts: [],
            selected: 0,
            followSuccess: false
          });
        })
        .catch(error => {
          this.setState({
            error
          });
        });
    } else if (name === "search") {
      this.setState({
        selected: 0,
        followSuccess: false
      });
      axios
        .get("http://localhost:1337/search", {
          params: {
            account: this.state.account
          }
        })
        .then(response => {
          const accounts = response.data;
          this.setState({
            accounts,
            error: ""
          });
        })
        .catch(error => {
          this.setState({
            error
          });
        });
    } else {
      this.setState({
        followSuccess: false
      });
      const accounts = [];
      this.state.accounts.forEach(function(elem) {
        if (elem.follow) {
          accounts.push(elem.id);
        }
      });
      axios
        .post("http://localhost:1337/follow", {
          accounts: JSON.stringify(accounts)
        })
        .then(response => {
          if (response.data === "OK") {
            this.setState({
              followSuccess: true,
              error: ""
            });
          } else {
            this.setState({
              error: response.data
            });
          }
        })
        .catch(error => {
          this.setState({
            error
          });
        });
    }
    event.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          {this.state.logged ? (
            <div>
              <h2 className="Login">Greetings, {this.state.login}!</h2>
              <input
                className="LoginButton"
                name="logoff"
                type="submit"
                value="Log off"
                onClick={this.handleSubmit}
              />
              <form
                className="SearchQuery"
                name="search"
                onSubmit={this.handleSubmit}
              >
                <label>
                  <input
                    type="text"
                    name="account"
                    value={this.state.account}
                    onChange={this.handleInputChange}
                  />
                </label>
                <input
                  className="SearchButton"
                  type="submit"
                  value="Find users"
                />
              </form>
              {this.state.selected > 0 && (
                <div className="FollowButton">
                  <input
                    type="submit"
                    value="Follow users"
                    name="follow"
                    onClick={this.handleSubmit}
                  />
                  {this.state.followSuccess && <p className="DoneMsg">Done!</p>}
                </div>
              )}
            </div>
          ) : (
            <form name="login" onSubmit={this.handleSubmit}>
              <label className="Login">
                Login:
                <input
                  type="text"
                  name="login"
                  value={this.state.login}
                  onChange={this.handleInputChange}
                />
              </label>
              <label className="Password">
                Password:
                <input
                  type="password"
                  name="password"
                  value={this.state.password}
                  onChange={this.handleInputChange}
                />
              </label>
              <input className="LoginButton" type="submit" value="Submit" />
            </form>
          )}
          <p className="ErrorMessage">{this.state.error}</p>
        </div>
        <div>
          {this.state.logged && (
            <ul>
              {this.state.accounts.map(account => (
                <li key={account.id}>
                  <input
                    name={account.id}
                    type="checkbox"
                    onChange={this.handleCheck}
                  />
                  {account.username}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
}

export default App;
