import axios from "axios";
import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import MyContext from "../contexts/MyContext";
import vi from "../lang/vi";
import SeoUtil from "../utils/SeoUtil";

class Myprofile extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: "",
      txtPassword: "",
      txtName: "",
      txtPhone: "",
      txtEmail: "",
    };
  }

  componentDidMount() {
    SeoUtil.updatePageMeta({
      title: vi.profileTitle,
      description: vi.profileMetaDesc,
    });

    if (this.context.customer) {
      this.setState({
        txtUsername: this.context.customer.username,
        txtPassword: this.context.customer.password,
        txtName: this.context.customer.name,
        txtPhone: this.context.customer.phone,
        txtEmail: this.context.customer.email,
      });
    }
  }

  render() {
    if (this.context.token === "") {
      return <Navigate replace to="/login" />;
    }

    return (
      <div className="align-center">
        <h2 className="text-center">{vi.myProfileTitle}</h2>

        <form>
          <table className="align-center">
            <tbody>
              <tr>
                <td>{vi.username}</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtUsername}
                    onChange={(e) => {
                      this.setState({ txtUsername: e.target.value });
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td>{vi.password}</td>
                <td>
                  <input
                    type="password"
                    value={this.state.txtPassword}
                    onChange={(e) => {
                      this.setState({ txtPassword: e.target.value });
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td>{vi.fullName}</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtName}
                    onChange={(e) => {
                      this.setState({ txtName: e.target.value });
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td>{vi.phone}</td>
                <td>
                  <input
                    type="tel"
                    value={this.state.txtPhone}
                    onChange={(e) => {
                      this.setState({ txtPhone: e.target.value });
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td>{vi.emailAddress}</td>
                <td>
                  <input
                    type="email"
                    value={this.state.txtEmail}
                    onChange={(e) => {
                      this.setState({ txtEmail: e.target.value });
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <input
                    type="submit"
                    value={vi.update}
                    onClick={(e) => this.btnUpdateClick(e)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername;
    const password = this.state.txtPassword;
    const name = this.state.txtName;
    const phone = this.state.txtPhone;
    const email = this.state.txtEmail;

    if (username && password && name && phone && email) {
      const customer = {
        username: username,
        password: password,
        name: name,
        phone: phone,
        email: email,
      };

      this.apiPutCustomer(this.context.customer._id, customer);
    } else {
      alert(vi.enterAllFields);
    }
  }

  apiPutCustomer(id, customer) {
    const config = {
      headers: { "x-access-token": this.context.token },
    };

    axios.put("/api/customer/customers/" + id, customer, config).then((res) => {
      const result = res.data;
      if (result.success === true) {
        alert(vi.updateSuccess);
        this.context.setCustomer(result.customer);
      } else {
        alert(result.message || vi.updateFailed);
      }
    }).catch(() => {
      alert(vi.updateFailed);
    });
  }
}

export default Myprofile;
