import { Route, Router } from '@solidjs/router';
import './App.css'

import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';

function App() {

  return (
    <>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
      </Router>
    </>
  )
}

export default App



