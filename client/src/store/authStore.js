import { create } from 'zustand'

const useAuth = create((set) => ({
  user: null,
  setUser: (newUser) => set({ user: newUser }),
  isSignup: false,
  setLogin: () => set({ isSignup: false }),
  setSignup: () => set({ isSignup: true }),
}))

// const useAuth = create((set) => ({
//   user: {
//     token: 'faketoken',
//     username: 'fakeuser',
//     name: 'fakename',
//     id: 'fakeid'
//   },
//   setUser: (newUser) => set({ user: newUser }),
//   isSignup: false,
//   setLogin: () => set({ isSignup: false }),
//   setSignup: () => set({ isSignup: true }),
// }))

export default useAuth
