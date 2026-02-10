import '../styles/LoginPage.css'
import useAuth from '../store/authStore'
import Login from '../components/login/Login'
import Signup from '../components/login/Signup'

const LoginPage = () => {
  const isSignup = useAuth(state => state.isSignup)

  return (
    <div className="login-page-container">
      {isSignup ? <Signup /> : <Login />}
    </div>
  )
}


export default LoginPage
