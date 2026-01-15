import { create } from 'zustand'

const useAuth = create((set) => ({
  user: null,
  setUser: (newUser) => set({ user: newUser }),
  isSignup: false,
  setLogin: () => set({ isSignup: false }),
  setSignup: () => set({ isSignup: true }),
}))

export default useAuth
