import React, { Component } from "react";
import MyContext from "../contexts/MyContext";
import { Link } from "react-router-dom";
import vi from "../lang/vi";

class Menu extends Component {
  static contextType = MyContext;

  render() {
    return (
      <div className="border-bottom">
        <div className="float-left">
          <ul className="menu">
            <li className="menu">
              <Link to="/admin/home">{vi.home}</Link>
            </li>
            <li className="menu">
              <li className="menu"><Link to='/admin/category'>{vi.category}</Link></li>
            </li>
            <li className="menu"><Link to='/admin/product'>{vi.product}</Link></li>
            <li className="menu"><Link to="/admin/order">{vi.order}</Link></li>
            <li className="menu"><Link to="/admin/customer">{vi.customer}</Link></li>
          </ul>
        </div>

        <div className="float-right">
          {vi.hello} <b>{this.context.username}</b> |{" "}
          <Link to="/admin/home" onClick={() => this.lnkLogoutClick()}>
            {vi.logout}
          </Link>
        </div>

        <div className="float-clear" />
      </div>
    );
  }

  // event handlers
  lnkLogoutClick() {
    this.context.setToken("");
    this.context.setUsername("");
  }
}

export default Menu;
