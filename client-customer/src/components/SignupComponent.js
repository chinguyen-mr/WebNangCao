import axios from 'axios';
import React, { Component } from 'react';
import withRouter from '../utils/withRouter';
import vi from '../lang/vi';
import SeoUtil from '../utils/SeoUtil';

class Signup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: ''
    };
  }

  componentDidMount() {
    SeoUtil.updatePageMeta({
      title: vi.signupMetaTitle,
      description: vi.signupMetaDesc,
    });
  }

  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">{vi.signupTitle}</h2>

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
                <td>{vi.fullName}</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtName}
                    onChange={(e) => this.setState({ txtName: e.target.value })}
                  />
                </td>
              </tr>

              <tr>
                <td>{vi.phone}</td>
                <td>
                  <input
                    type="tel"
                    value={this.state.txtPhone}
                    onChange={(e) => this.setState({ txtPhone: e.target.value })}
                  />
                </td>
              </tr>

              <tr>
                <td>{vi.emailAddress}</td>
                <td>
                  <input
                    type="email"
                    value={this.state.txtEmail}
                    onChange={(e) => this.setState({ txtEmail: e.target.value })}
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <input
                    type="submit"
                    value={vi.signUp}
                    onClick={(e) => this.btnSignupClick(e)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  btnSignupClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername.trim();
    const password = this.state.txtPassword;
    const name = this.state.txtName.trim();
    const phone = this.state.txtPhone.trim();
    const email = this.state.txtEmail.trim();

    if (username && password && name && phone && email) {
      const account = { username, password, name, phone, email };
      this.apiSignup(account);
    } else {
      alert(vi.enterAllFields);
    }
  }

  apiSignup(account) {
    axios.post('/api/auth/customer/signup', account)
      .then((res) => {
        const result = res.data;
        if (result.success === true) {
          alert(result.message); // "Đăng ký thành công! Vui lòng kiểm tra email..."
          this.props.navigate('/active'); // Chuyển sang trang nhập ID + Token
        } else {
          alert(result.message);
        }
      })
      .catch(() => {
        alert('Đăng ký thất bại. Vui lòng thử lại.');
      });
  }
}

export default withRouter(Signup);