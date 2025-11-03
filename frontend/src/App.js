import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './components/auth/Signup'
import Signin from './components/auth/Signin'
import Navigation from './components/templates/Navigation';
import Footer from './components/templates/Footer';
import { Box } from '@mui/material';
import { AuthProvider } from './components/auth/AuthContext';

function App() {

  return (
    <AuthProvider>
    <BrowserRouter>
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />

    <Box sx={{ flexGrow: 1 }} flex justifyContent={'center'} alignContent={'center'} flexDirection={'column'} >
          <Routes>
            <Route path='/' element={'main'} />
            <Route path='/auth'>
              <Route path='signup' element={<Signup />} />
              <Route path='signin' element={<Signin />} />
            </Route>
          </Routes>
    </Box>
      <Footer />
    </div>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
