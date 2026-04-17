import axios from "axios";
import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import MyContext from "../contexts/MyContext";
import withRouter from "../utils/withRouter";
import vi from "../lang/vi";
import SeoUtil from "../utils/SeoUtil";

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: "",
      txtPassword: "",
    };
  }

  componentDidMount() {
    SeoUtil.updatePageMeta({
      title: 'Đăng nhập | Trầm Tịnh',
      description: 'Đăng nhập vào tài khoản Trầm Tịnh để truy cập giỏ hàng, lịch sử đơn hàng và quản lý hồ sơ cá nhân.',
    });
  }

  render() {
    if (this.context.token !== "") {
      return <Navigate replace to="/home" />;
    }

    return (
      <div className="align-center">
        <h2 className="text-center">{vi.loginTitle}</h2>

        <form>
          <table className="align-center">
            <tbody>
              <tr>
                <td>{vi.username}</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtUsername}
                    onChange={(e) => this.setState({ txtUsername: e.target.value })}
                  />
                </td>
              </tr>

              <tr>
                <td>{vi.password}</td>
                <td>
                  <input
                    type="password"
                    value={this.state.txtPassword}
                    onChange={(e) => this.setState({ txtPassword: e.target.value })}
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <input
                    type="submit"
                    value={vi.login}
                    onClick={(e) => this.btnLoginClick(e)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  btnLoginClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername.trim();
    const password = this.state.txtPassword;

    if (username && password) {
      this.apiLogin({ username, password });
    } else {
      alert(vi.enterUsernameAndPassword);
    }
  }

  apiLogin(account) {
    axios.post("/api/auth/customer/login", account).then((res) => {
      const result = res.data;
      if (result.success === true) {
        
        // 1. Prepare Carts for Merge
        const dbCart = result.customer.cart || [];
        const localGuestCart = this.context.mycart || [];
        let mergedCart = [...dbCart];

        // 2. Perform intelligent merge (sum quantities if item exists)
        localGuestCart.forEach(localItem => {
          let found = mergedCart.find(dbItem => dbItem.product._id === localItem.product._id);
          if (found) {
            found.quantity += localItem.quantity;
          } else {
            mergedCart.push(localItem);
          }
        });

        // 3. Set Context + sync cart atomically (loginSession tránh race condition)
        this.context.loginSession(result.token, result.customer, mergedCart);

        this.props.navigate("/home");
      } else {
        alert(result.message);
      }
    }).catch(() => {
      alert(vi.loginFailed);
    });
  }
}

export default withRouter(Login);
