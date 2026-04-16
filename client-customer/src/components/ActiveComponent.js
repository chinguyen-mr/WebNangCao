import axios from "axios";
import { Component } from "react";
import withRouter from "../utils/withRouter";
import vi from "../lang/vi";
import SeoUtil from "../utils/SeoUtil";

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: "",
      txtToken: "",
    };
  }

  componentDidMount() {
    SeoUtil.updatePageMeta({
      title: 'Kích hoạt tài khoản | Trầm Tịnh',
      description: 'Kích hoạt tài khoản của bạn tại Trầm Tịnh để bắt đầu mua sắm trầm hương cao cấp và nhận ưu đãi đặc biệt.',
    });
  }

  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">{vi.activateAccount}</h2>

        <form>
          <table className="align-center">
            <tbody>
              <tr>
                <td>ID</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtID}
                    onChange={(e) => this.setState({ txtID: e.target.value })}
                  />
                </td>
              </tr>

              <tr>
                <td>Token</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtToken}
                    onChange={(e) => this.setState({ txtToken: e.target.value })}
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <input
                    type="submit"
                    value={vi.activate}
                    onClick={(e) => this.btnActiveClick(e)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  btnActiveClick(e) {
    e.preventDefault();
    const id = this.state.txtID.trim();
    const token = this.state.txtToken.trim();

    if (id && token) {
      this.apiActive(id, token);
    } else {
      alert(vi.enterIdAndToken);
    }
  }

  apiActive(id, token) {
    axios.post("/api/auth/customer/active", { id, token }).then((res) => {
      const result = res.data;
      if (result.success === true) {
        alert(vi.accountActivated);
        this.props.navigate("/login");
      } else {
        alert(result.message || vi.activationFailed);
      }
    }).catch(() => {
      alert(vi.activationFailed);
    });
  }
}

export default withRouter(Active);
