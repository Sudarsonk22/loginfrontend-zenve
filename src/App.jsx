import './App.css'
import Login from './components/Login'
import RegisterForm from './components/Register'
import Dashboard from './components/Dashboard'
import VerifyOtp from './components/VerifyOtp'
import { BrowserRouter } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { Routes } from 'react-router-dom'
function App() {

  return (
    <>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterForm />} />
        <Route path="/login" element={<Login />} />
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path="/verify-otp" element={<VerifyOtp />} />
      </Routes>
    </BrowserRouter>
      </>
  )
}

export default App