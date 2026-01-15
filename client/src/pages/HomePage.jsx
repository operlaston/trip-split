import useAuth from '../store/authStore'

const HomePage = () => {
  const user = useAuth(state => state.user)

  return (
    <div>
      <div>
        Welcome, {user.name}
      </div>
      <div>
        username: {user.username}
      </div>
      <div>
        id: {user.id}
      </div>
    </div>
  )
}

export default HomePage
