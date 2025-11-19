import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  InputBase,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Slide,
  Grid,
  // Badge 컴포넌트 import 다시 추가
  Badge,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  ForumOutlined,
  Inventory2Outlined,
  OutlinedFlag,
} from "@mui/icons-material";
import { useAlert } from "../utilities/AlertContext";
import { BG_COLOR, TEXT_COLOR } from '../constants/Theme'


// AppBar 커스텀 스타일
const ModernAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: BG_COLOR,
  boxShadow: "none",
  borderBottom: `1px solid ${TEXT_COLOR}`,
  color: TEXT_COLOR,
  zIndex: theme.zIndex.drawer + 1,
}));

// 로고 타이포그래피 커스텀 스타일
const LogoTypography = styled(Typography)(({ theme }) => ({
  fontFamily: "Roboto, Arial, sans-serif",
  fontWeight: 700,
  letterSpacing: "0.1em",
  color: TEXT_COLOR,
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  textDecoration: "none",

  fontSize: "1.6rem",
  "& .MuiSvgIcon-root": {
    marginRight: theme.spacing(1),
    fontSize: "2rem",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.2rem",
    "& .MuiSvgIcon-root": {
      fontSize: "1.5rem",
    },
  },
}));

// 오버레이 검색 영역 스타일
const SearchOverlay = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100vh",
  backgroundColor: alpha(BG_COLOR, 0.5),
  zIndex: theme.zIndex.drawer,
  paddingTop: theme.spacing(10),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",

  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
}));

// 검색 입력 필드 스타일
const SearchInput = styled(InputBase)(({ theme }) => ({
  fontSize: "1.5rem",
  width: "80%",
  maxWidth: "800px",
  borderBottom: `3px solid ${TEXT_COLOR}`,
  paddingBottom: theme.spacing(1),
  textAlign: "center",
  "& .MuiInputBase-input": {
    textAlign: "center",
    color: TEXT_COLOR,
    padding: 0,
    "&::placeholder": {
      fontSize: "1.5rem",
      opacity: 0.7,
    },
  },
}));

const Navigation = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { isLoggedIn, user, logout } = useAuth();
  const { haveNewAlert } = useAlert();

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const handleSearchExecute = () => {
    if (searchTerm.trim()) {
      console.log("검색 실행:", searchTerm);
      // TODO 실제 검색 API 호출 또는 페이지 이동 로직 추가 예정
      handleSearchClose();
    } else {
      console.log("검색어를 입력해 주세요.");
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchExecute();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleSearchClose();
    }
  };

  // 로그인 상태에 따른 네비게이션 아이템 정의
  const navItems = isLoggedIn
    ? [
        { text: user.username, path: "/my/page", isUser: true },
        { text: "로그아웃", path: "#", onClick: logout, isLogout: true },
      ]
    : [
        { text: "회원가입", path: "/auth/signup" },
        { text: "로그인", path: "/auth/signin" },
      ];

  // 사이드바 내용 컴포넌트
  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ width: 250, bgcolor: BG_COLOR, height: "100%" }}
    >
      <Toolbar />
      <List>
        {/* 사이드바 상단: 보관함 및 알림 버튼 */}
        <Grid
          container
          spacing={1} // 아이템 사이의 간격
          sx={{
            p: 2,
            borderBottom: `1px solid ${alpha(TEXT_COLOR, 0.1)}`,
            margin: 0,
            width: "100%",
          }}
        >
          {/* 보관함 버튼 */}
          <Grid size={{ xs: 6 }} sx={{ p: "0 !important" }}>
            <Button
              component={Link}
              to="/my/favorite"
              onClick={handleDrawerToggle}
              color="inherit"
              aria-label="좋아요"
              sx={{
                width: "100%",
                p: "12px 0",
                color: TEXT_COLOR,
                border: `1px solid ${TEXT_COLOR}`,
                "& .MuiButton-startIcon": { m: 0 },
              }}
              startIcon={
                <FavoriteBorderOutlinedIcon sx={{ fontSize: "1.5rem" }} />
              }
            >
            </Button>
          </Grid>

          <Grid size={{ xs: 6 }} sx={{ p: "0 !important" }}>
            <Button
              component={Link}
              to="/my/actives"
              onClick={handleDrawerToggle}
              color="inherit"
              aria-label="내 활동"
              sx={{
                width: "100%",
                p: "12px 0",
                color: TEXT_COLOR,
                border: `1px solid ${TEXT_COLOR}`,
                "& .MuiButton-startIcon": { m: 0 },
              }}
              startIcon={<Inventory2Outlined sx={{ fontSize: "1.5rem" }} />}
            >
            </Button>
          </Grid>

          {/* 알림 버튼 */}
          <Grid size={{ xs: 6 }} sx={{ p: "0 !important" }}>
            {/* Badge 컴포넌트 */}
            <Button
              component={Link}
              to="/my/alerts"
              onClick={handleDrawerToggle}
              color="inherit"
              aria-label="알림"
              sx={{
                width: "100%",
                p: "12px 0",
                color: TEXT_COLOR,
                border: `1px solid ${TEXT_COLOR}`,
                "& .MuiButton-startIcon": { m: 0 },
              }}
              startIcon={
                <Badge
                  color="error"
                  variant="dot"
                  invisible={!haveNewAlert} // haveNewAlert가 false일 때 숨김
                >
                  <NotificationsNoneIcon sx={{ fontSize: "1.5rem" }} />
                </Badge>
              }
            ></Button>
          </Grid>
          {/* 커뮤니티 버튼 */}
          <Grid size={{ xs: 6 }} sx={{ p: "0 !important" }}>
            <Button
              component={Link}
              to="/chat/list"
              onClick={handleDrawerToggle}
              color="inherit"
              aria-label="커뮤니티"
              sx={{
                width: "100%",
                p: "12px 0",
                color: TEXT_COLOR,
                border: `1px solid ${TEXT_COLOR}`,
                "& .MuiButton-startIcon": { m: 0 },
              }}
            >
              <ForumOutlined sx={{ fontSize: "1.5rem" }} />
            </Button>
          </Grid>
          {/* 신고 목록 버튼 */}
          {user.role === "관리자" && (
            <Grid size={{ xs: 12 }} sx={{ p: "0 !important" }}>
              <Button
                component={Link}
                to="/admin/report"
                onClick={handleDrawerToggle}
                color="inherit"
                aria-label="신고 목록"
                sx={{
                  width: "100%",
                  p: "12px 0",
                  color: TEXT_COLOR,
                  border: `1px solid ${TEXT_COLOR}`,
                  // border: 'none', // 테두리 제거 (요청에 따라)
                  "& .MuiButton-startIcon": { m: 0 }, // 아이콘만 남기기 위해 텍스트 제거
                }}
              >
                <OutlinedFlag sx={{ fontSize: "1.5rem" }} />
              </Button>
            </Grid>
          )}
        </Grid>

        {/* 기존 navItems 목록 */}
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            disablePadding
            component={item.path !== "#" ? Link : "div"}
            to={item.path !== "#" ? item.path : null}
            sx={{
              textDecoration: "none",
              color: "inherit",
              margin: "16px 16px",
              width: "calc(100% - 32px)",
            }}
          >
            {item.isLogout ? (
              <Button
                onClick={
                  item.onClick
                    ? (e) => {
                        e.preventDefault();
                        item.onClick();
                        handleDrawerToggle();
                      }
                    : undefined
                }
                color="inherit"
                variant="outlined"
                sx={{
                  width: "100%",
                  justifyContent: "center",
                  p: "8px 16px",
                  textTransform: "none",
                  color: TEXT_COLOR,
                  borderColor: TEXT_COLOR,
                  fontWeight: 600,
                }}
                aria-label="로그아웃"
                startIcon={<LogoutIcon sx={{ height: "32px" }} />}
              >
                {item.text}
              </Button>
            ) : (
              // (로그인, 회원가입, 사용자명)
              <Button
                sx={{
                  color: TEXT_COLOR,
                  width: "100%",
                  justifyContent: item.isUser ? "center" : "flex-start",
                  p: item.isUser ? "8px 16px" : 2,
                  textTransform: "none",
                  ...(item.isUser && {
                    border: `1px solid ${TEXT_COLOR}`,
                    fontWeight: 600,
                  }),
                  ...((item.text === "로그인" || item.text === "회원가입") && {
                    border: "none",
                    fontWeight: 500,
                    justifyContent: "center",
                    p: "8px 16px",
                  }),
                }}
                variant={item.isUser ? "outlined" : "text"}
                onClick={
                  item.onClick
                    ? (e) => {
                        e.preventDefault();
                        item.onClick();
                        handleDrawerToggle();
                      }
                    : undefined
                }
              >
                <ListItemText
                  primary={item.text}
                  sx={{ textAlign: "center" }}
                />
              </Button>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <ModernAppBar position="fixed">
        <Container maxWidth="xl" disableGutters={false}>
          <Toolbar sx={{ minHeight: "64px", px: { xs: 2, md: 0 } }}>
            {/* 로고 영역 */}
            <LogoTypography variant="h6" component={Link} to="/">
              BBBB
            </LogoTypography>

            <Box sx={{ flexGrow: 1 }} />

            {/* 데스크톱 (sm 이상) 네비게이션 아이콘 및 버튼 그룹 */}
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: { sm: 1, md: 2 },
              }}
            >
              {isLoggedIn ? (
                // 로그인 상태
                <>
                  {/* 검색 아이콘 */}
                  <IconButton
                    color="inherit"
                    onClick={
                      isSearchOpen
                        ? handleSearchClose
                        : () => setIsSearchOpen(true)
                    }
                  >
                    {isSearchOpen ? (
                      <CloseIcon sx={{ fontSize: "1.7rem" }} />
                    ) : (
                      <SearchIcon sx={{ fontSize: "1.7rem" }} />
                    )}
                  </IconButton>

                  {/* 신고 목록 버튼 */}
                  {user.role === "관리자" && (
                    <IconButton
                      color="inherit"
                      component={Link}
                      to="/admin/report"
                      aria-label="신고 목록"
                    >
                      <OutlinedFlag sx={{ fontSize: "1.7rem" }} />
                    </IconButton>
                  )}

                  {/* 커뮤니티 버튼 */}
                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/chat/list"
                    aria-label="커뮤니티"
                  >
                    <ForumOutlined sx={{ fontSize: "1.7rem" }} />
                  </IconButton>

                  {/* 보관함 아이콘 */}
                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/my/favorite"
                    aria-label="좋아요"
                  >
                    <FavoriteBorderOutlinedIcon sx={{ fontSize: "1.7rem" }} />
                  </IconButton>

                  {/* 보관함 아이콘 */}
                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/my/actives"
                    aria-label="내 활동"
                  >
                    <Inventory2Outlined sx={{ fontSize: "1.7rem" }} />
                  </IconButton>

                  {/* 알림 아이콘 */}

                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/my/alerts"
                    aria-label="알림"
                  >
                    <Badge
                      color="error"
                      variant="dot"
                      invisible={!haveNewAlert} // haveNewAlert가 false일 때 숨김
                    >
                      <NotificationsNoneIcon sx={{ fontSize: "1.7rem" }} />
                    </Badge>
                  </IconButton>

                  {/* 사용자명 버튼 (테두리 유지) */}
                  <Button
                    component={Link}
                    to="/my/page"
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      borderColor: TEXT_COLOR,
                      color: TEXT_COLOR,
                      fontWeight: 600,
                      mr: 1,
                      "&:hover": {
                        backgroundColor: alpha(TEXT_COLOR, 0.05),
                        borderColor: TEXT_COLOR,
                      },
                    }}
                  >
                    {user.username}
                  </Button>

                  {/* 로그아웃 버튼 */}
                  <IconButton
                    color="inherit"
                    onClick={logout}
                    aria-label="로그아웃"
                  >
                    <LogoutIcon sx={{ fontSize: "1.7rem" }} />
                  </IconButton>
                </>
              ) : (
                // 비로그인 상태
                <>
                  {/* 검색 아이콘 */}
                  <IconButton
                    color="inherit"
                    onClick={
                      isSearchOpen
                        ? handleSearchClose
                        : () => setIsSearchOpen(true)
                    }
                    sx={{ mr: 1 }}
                  >
                    {isSearchOpen ? (
                      <CloseIcon sx={{ fontSize: "1.7rem" }} />
                    ) : (
                      <SearchIcon sx={{ fontSize: "1.7rem" }} />
                    )}
                  </IconButton>
                  {/* 회원가입 */}
                  <Button
                    color="inherit"
                    component={Link}
                    to="/auth/signup"
                    sx={{ fontWeight: 500 }}
                  >
                    회원가입
                  </Button>
                  {/* 로그인 */}
                  <Button
                    color="inherit"
                    sx={{ ml: 2, fontWeight: 500 }}
                    component={Link}
                    to="/auth/signin"
                  >
                    로그인
                  </Button>
                </>
              )}
            </Box>

            {/* 모바일 */}
            <Box
              sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center" }}
            >
              {/* 검색/닫기 아이콘 버튼 */}
              <IconButton
                color="inherit"
                onClick={
                  isSearchOpen ? handleSearchClose : () => setIsSearchOpen(true)
                }
                sx={{ mr: 1, p: 1 }}
              >
                {isSearchOpen ? (
                  <CloseIcon sx={{ fontSize: "1.7rem" }} />
                ) : (
                  <SearchIcon sx={{ fontSize: "1.7rem" }} />
                )}
              </IconButton>

              {/* 햄버거 메뉴 버튼 */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ p: 1 }}
              >
                <MenuIcon sx={{ fontSize: "1.7rem" }} />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </ModernAppBar>

      {/* 토글 검색 오버레이 */}
      {isSearchOpen && (
        <SearchOverlay onClick={handleSearchClose}>
          <Slide direction="down" in={isSearchOpen} mountOnEnter unmountOnExit>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <SearchInput
                placeholder="해당 기능은 현재 개발중입니다."
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <Button
                sx={{ mt: 3, color: TEXT_COLOR }}
                onClick={handleSearchExecute}
              >
                검색
              </Button>
            </Box>
          </Slide>
        </SearchOverlay>
      )}

      {/* 토글 사이드바 (모바일용) */}
      <nav>
        <Drawer
          variant="temporary"
          open={isDrawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          anchor="right"
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
};

export default Navigation;
