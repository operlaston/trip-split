import { signup } from '../../api/loginService'
import { useState } from 'react'
import useAuth from '../../store/authStore'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  })

  const { name, username, password } = formData
  const [isLoading, setIsLoading] = useState('')
  const [error, setError] = useState('')

  const setLogin = useAuth(state => state.setLogin)

  const handleChange = e => {
    setError('')
    const { name, value } = e.target
    const newValue = value
    setFormData(prevState => ({
      ...prevState,
      [name]: newValue
    }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    if (name.length === 0) {
      setError('name cannot be empty')
      setIsLoading(false)
      return
    }
    else if (username.length === 0) {
      setError('username cannot be empty')
      setIsLoading(false)
      return
    }
    else if (password.length < 8) {
      setError('password must be at least 8 characters')
      setIsLoading(false)
      return
    }
    try {
      await signup({ name, username, password });
      setLogin()
    }
    catch (e) {
      if (e.status === 409) {
        setError('username already exists')
      }
      else {
        setError('an unknown error occurred')
      }
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignup} className="login-container">
      <h1 className="login-header">
        Signup
      </h1>
      <div className="login-inputs-container">
        <input className="login-input" name="name" placeholder="Name" type="text" value={name} onChange={handleChange} />
        <input className="login-input" name="username" placeholder="Username" type="text" value={username} onChange={handleChange} />
        <input className="login-input" name="password" placeholder="Password" type="password" value={password} onChange={handleChange} />
      </div>
      <div className="login-error">
        {error}
      </div>
      <div className="login-bottom-container">
        {isLoading ?
          <button disabled className="button-loading login-button">Signing up...</button>
          : <button type="submit" className="login-button">Sign up</button>
        }
        <div className="login-switch-text">
          Already have an account? Log in <span className="login-signup-switch" onClick={() => { if (!isLoading) setLogin() }}>here</span>
        </div>
      </div>
    </form>
  )
}

export default Signup
