import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('currentUser'));
  } catch (error) {
    console.error('❌ Error parsing currentUser from localStorage:', error);
  }

  const isLoggedIn = user && user.loggedIn;

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
