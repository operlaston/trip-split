import { login } from '../../api/loginService'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { setToken } from '../../api/api'
import useAuth from '../../store/authStore'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const { username, password } = formData

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const setSignup = useAuth(state => state.setSignup)
  const setUser = useAuth(state => state.setUser)

  const navigate = useNavigate()

  const handleChange = e => {
    setError('')
    const { name, value } = e.target
    const newValue = value
    setFormData(prevState => ({
      ...prevState,
      [name]: newValue
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    if (username.length === 0) {
      setError("username field is empty")
      setIsLoading(false)
      return
    }
    else if (password.length === 0) {
      setError("password field is empty")
      setIsLoading(false)
      return
    }
    try {
      const user = await login({ username, password });
      setUser(user)
      setToken(user.token)
      navigate('/')
    }
    catch (e) {
      if (e.status === 404) {
        setError('no user exists with the given username')
      }
      else if (e.status === 401) {
        setError('incorrect password')
      }
      else {
        setError('an unknown error occurred')
      }
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="login-container">
      <h1 className="login-header">
        Login
      </h1>
      <div className="login-inputs-container">
        <input className="login-input" name="username" placeholder="Username" type="text" value={username} onChange={handleChange} />
        <input className="login-input" name="password" placeholder="Password" type="password" value={password} onChange={handleChange} />
      </div>
      <div className="login-error">
        {error}
      </div>
      <div className="login-bottom-container">
        {isLoading ?
          <button disabled className="button-loading">Logging in...</button>
          : <button type="submit" className="login-button">Log in</button>
        }
        <div className="login-switch-text">
          Don't have an account? Sign up <span className="login-signup-switch" onClick={() => { if (!isLoading) setSignup() }}>here</span>
        </div>
      </div>
    </form>
  )
}

export default Login
