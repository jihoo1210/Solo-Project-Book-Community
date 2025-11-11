import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './components/auth/Signup'
import Signin from './components/auth/Signin'
import Navigation from './components/templates/Navigation';
import Footer from './components/templates/Footer';
import { Box } from '@mui/material';
import { AuthProvider } from './components/auth/AuthContext';
import PostsList from './components/posts/PostsList';
import PostsDetail from './components/posts/PostsDetail';
import PostsCreate from './components/posts/PostsCreate';
import PostsEdit from './components/posts/PostsEdit';
import MyPage from './components/user/MyPage';
import MyActivities from './components/user/MyActives';
import MyFavorite from './components/user/MyFavorite';
import MyAlert from './components/user/MyAlert';

function App() {

  return (
    <AuthProvider>
    <BrowserRouter>
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />

    <Box sx={{ flexGrow: 1 }} flex justifyContent={'center'} alignContent={'center'} flexDirection={'column'} >
          <Routes>
            <Route path='/auth'>
              <Route path='signup' element={<Signup />} />
              <Route path='signin' element={<Signin />} />
            </Route>
            <Route path='/post'>
             <Route path=':id' element={<PostsDetail />} />
             <Route path='create' element={<PostsCreate />} />
             <Route path='edit/:id' element={<PostsEdit />} />
            </Route>
            <Route path='/my'>
              <Route path='page' element={<MyPage />} />
              <Route path='actives' element={<MyActivities />} />
              <Route path='favorite' element={<MyFavorite />} />
              <Route path='alerts' element={<MyAlert />} />
            </Route>
            <Route path='*' element={<PostsList />} />
          </Routes>
    </Box>
      <Footer />
    </div>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;