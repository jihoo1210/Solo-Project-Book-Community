import "./index.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Signup from "./components/auth/Signup";
import Signin from "./components/auth/Signin";
import Navigation from "./components/templates/Navigation";
import Footer from "./components/templates/Footer";
import { Box, ThemeProvider } from "@mui/material";
import { AuthProvider } from "./components/auth/AuthContext";
import PostsList from "./components/posts/PostsList";
import PostsDetail from "./components/posts/PostsDetail";
import PostsCreate from "./components/posts/PostsCreate";
import PostsEdit from "./components/posts/PostsEdit";
import MyPage from "./components/user/MyPage";
import MyActivities from "./components/user/MyActives";
import MyFavorite from "./components/user/MyFavorite";
import MyAlert from "./components/user/MyAlert";
import { AlertProvider } from "./components/utilities/AlertContext";
import ResetPassword from "./components/auth/ResetPassword";
import ChatRoom from "./components/chat/ChatRoom";
import theme from "./components/constants/Theme";
import ChatList from "./components/chat/ChatList";
import AdminPage from "./components/admin/AdminPage";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <ThemeProvider theme={theme} >
        <AlertProvider>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Navigation />

            <Box
              sx={{ flexGrow: 1 }}
              flex
              justifyContent={"center"}
              alignContent={"center"}
              flexDirection={"column"}
            >
              <Routes>
                <Route path="/auth">
                  <Route path="resetPassword" element={<ResetPassword />} />
                  <Route path="signup" element={<Signup />} />
                  <Route path="signin" element={<Signin />} />
                </Route>
                <Route path="/post">
                  <Route path=":id" element={<PostsDetail />} />
                  <Route path="create" element={<PostsCreate />} />
                  <Route path="edit/:id" element={<PostsEdit />} />
                </Route>
                <Route path="/my">
                  <Route path="page" element={<MyPage />} />
                  <Route path="actives" element={<MyActivities />} />
                  <Route path="favorite" element={<MyFavorite />} />
                  <Route path="alerts" element={<MyAlert />} />
                </Route>
                <Route path="/chat">
                  <Route path="room/:roomId" element={<ChatRoom />} />
                  <Route path="list" element={<ChatList />} />
                </Route>
                <Route path="/admin">
                  <Route path="report" element={<AdminPage />} />
                </Route>
                <Route path="*" element={<PostsList />} />
              </Routes>
            </Box>
            <Footer />
          </div>
        </AlertProvider>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
