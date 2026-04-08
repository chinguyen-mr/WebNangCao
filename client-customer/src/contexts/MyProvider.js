import { Component } from "react";
import MyContext from "./MyContext";
import axios from "axios";

class MyProvider extends Component {
  constructor(props) {
    super(props);

    // Restore auth state from localStorage on app load
    const storedToken = localStorage.getItem('customer_token') || "";

    let storedCustomer = null;
    try {
      const raw = localStorage.getItem('customer_data');
      storedCustomer = raw ? JSON.parse(raw) : null;
    } catch (_) {
      localStorage.removeItem('customer_data');
    }

    let storedCart = [];
    try {
      const raw = localStorage.getItem('customer_cart');
      storedCart = raw ? JSON.parse(raw) : [];
    } catch (_) {
      localStorage.removeItem('customer_cart');
    }

    this.state = {
      token: storedToken,
      customer: storedCustomer,
      mycart: storedCart,

      setToken: this.setToken,
      setCustomer: this.setCustomer,
      setMycart: this.setMycart,
      logout: this.logout,
    };
  }

  componentDidMount() {
    // Validate stored token against server on every app load
    if (this.state.token) {
      this.validateToken();
    }
  }

  validateToken = async () => {
    try {
      const res = await axios.get('/api/auth/token', {
        headers: { 'x-access-token': this.state.token }
      });
      if (!res.data.success) {
        this.logout();
      }
    } catch (_) {
      // Network error or 500 — keep session rather than force logout
      // Only logout on explicit auth failure (success: false)
    }
  };

  setToken = (value) => {
    this.setState({ token: value });
    if (value) {
      localStorage.setItem('customer_token', value);
    } else {
      localStorage.removeItem('customer_token');
    }
  };

  setCustomer = (value) => {
    this.setState({ customer: value });
    if (value) {
      localStorage.setItem('customer_data', JSON.stringify(value));
    } else {
      localStorage.removeItem('customer_data');
    }
  };

  setMycart = (value) => {
    this.setState({ mycart: value });
    localStorage.setItem('customer_cart', JSON.stringify(value));
    
    // Background sync to database if registered user
    if (this.state.token && this.state.customer) {
      this.syncCartWithServer(value);
    }
  };

  syncCartWithServer = (cartData) => {
    axios.put(`/api/customer/cart/${this.state.customer._id}`, { cart: cartData }, {
      headers: { 'x-access-token': this.state.token }
    }).catch(e => {
       console.error("Silent cart sync failed:", e.message);
    });
  };

  logout = () => {
    this.setState({ token: "", customer: null, mycart: [] });
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    localStorage.removeItem('customer_cart');
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
