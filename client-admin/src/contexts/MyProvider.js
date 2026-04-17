import React, { Component } from 'react';
import MyContext from './MyContext';
import axios from 'axios';

class MyProvider extends Component {
  constructor(props) {
    super(props);

    // Initialize state from localStorage
    const storedToken = localStorage.getItem('admin_token');
    const storedUsername = localStorage.getItem('admin_username');

    this.state = {
      token: storedToken || '',
      username: storedUsername || '',

      // functions
      setToken: this.setToken,
      setUsername: this.setUsername,
      logout: this.logout,
    };
  }

  componentDidMount() {
    // Validate stored token on app load
    if (this.state.token) {
      this.validateToken();
    }
  }

  validateToken = async () => {
    try {
      const response = await axios.get('/api/auth/token', {
        headers: { 'x-access-token': this.state.token }
      });
      if (!response.data.success) {
        // Token is invalid, clear it
        this.logout();
      }
    } catch (error) {
      // Network error — keep session, do not force logout
    }
  };

  setToken = (value) => {
    this.setState({ token: value });
    if (value) {
      localStorage.setItem('admin_token', value);
    } else {
      localStorage.removeItem('admin_token');
    }
  };

  setUsername = (value) => {
    this.setState({ username: value });
    if (value) {
      localStorage.setItem('admin_username', value);
    } else {
      localStorage.removeItem('admin_username');
    }
  };

  logout = () => {
    this.setState({ token: '', username: '' });
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
  };

  render() {
    return (
      <MyContext.Provider value={this.state}>
        {this.props.children}
      </MyContext.Provider>
    );
  }
}

export default MyProvider;
