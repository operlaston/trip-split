import { useState } from 'react'
import './styles/App.css'
import { Routes, Route } from 'react-router'
import Login from './pages/Login'

function App() {

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  )
}

export default App
