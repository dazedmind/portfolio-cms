import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// import NavBar from './component/NavBar'
import LoginPage from './login/page'
import HomePage from './home/page'

function App() {

  return (
    <Router>
      <Routes>  
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>

  )
}

export default App
