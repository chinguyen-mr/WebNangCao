import { useNavigate, useLocation, useParams } from 'react-router-dom';

function withRouter(Component) {
  return (props) => (
    <Component
      {...props}
      navigate={useNavigate()}
      location={useLocation()}
      params={useParams()}
    />
  );
}

export default withRouter;
