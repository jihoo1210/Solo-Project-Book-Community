import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, Container, InputBase,
    IconButton, Drawer, List, ListItem, ListItemText, Slide, Grid
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
// 💡 수정: 로그아웃 아이콘 임포트 추가
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Inventory2Outlined } from '@mui/icons-material';

// 색상 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';

// AppBar 커스텀 스타일
const ModernAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: BG_COLOR,
    boxShadow: 'none',
    borderBottom: `1px solid ${TEXT_COLOR}`,
    color: TEXT_COLOR,
    zIndex: theme.zIndex.drawer + 1,
}));

// 로고 타이포그래피 커스텀 스타일
const LogoTypography = styled(Typography)(({ theme }) => ({
    fontFamily: 'Roboto, Arial, sans-serif',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: TEXT_COLOR,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    textDecoration: 'none',

    fontSize: '1.6rem',
    '& .MuiSvgIcon-root': {
        marginRight: theme.spacing(1),
        fontSize: '2rem',
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.2rem',
        '& .MuiSvgIcon-root': {
            fontSize: '1.5rem',
        },
    }
}));


// 오버레이 검색 영역 스타일
const SearchOverlay = styled(Box)(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    backgroundColor: alpha(BG_COLOR, 0.5),
    zIndex: theme.zIndex.drawer,
    paddingTop: theme.spacing(10),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
}));

// 검색 입력 필드 스타일
const SearchInput = styled(InputBase)(({ theme }) => ({
    fontSize: '1.5rem',
    width: '80%',
    maxWidth: '800px',
    borderBottom: `3px solid ${TEXT_COLOR}`,
    paddingBottom: theme.spacing(1),
    textAlign: 'center',
    '& .MuiInputBase-input': {
        textAlign: 'center',
        color: TEXT_COLOR,
        padding: 0,
        '&::placeholder': {
            fontSize: '1.5rem',
            opacity: 0.7,
        },
    }
}));


const Navigation = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { isLoggedIn, user, logout } = useAuth();

    const handleDrawerToggle = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const handleSearchClose = () => {
        setIsSearchOpen(false);
        setSearchTerm('');
    };

    const handleSearchExecute = () => {
        if (searchTerm.trim()) {
            console.log("검색 실행:", searchTerm);
            // 여기에 실제 검색 API 호출 또는 페이지 이동 로직 추가
            handleSearchClose();
        } else {
            console.log("검색어를 입력해 주세요.");
        }
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearchExecute();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            handleSearchClose();
        }
    };

    // 로그인 상태에 따른 네비게이션 아이템 정의
    const navItems = isLoggedIn ?
        [
            { text: user.username, path: '/my/page', isUser: true }, // 사용자 정보 버튼 (테두리 유지)
            { text: '로그아웃', path: '#', onClick: logout, isLogout: true } // 로그아웃 아이콘 버튼으로 변경
        ] :
        [
            { text: '회원가입', path: '/auth/signup' },
            { text: '로그인', path: '/auth/signin' }
        ];


    // 사이드바 내용 컴포넌트
    const drawer = (
        <Box
            onClick={handleDrawerToggle}
            sx={{ width: 250, bgcolor: BG_COLOR, height: '100%' }}
        >
            <Toolbar />
            <List>
                {/* 사이드바 상단: 보관함 및 알림 버튼 (요청에 따라 Grid로 크기 xs=6 설정) */}
                <Grid
                    container
                    spacing={1} // 아이템 사이의 간격
                    sx={{
                        p: 2,
                        borderBottom: `1px solid ${alpha(TEXT_COLOR, 0.1)}`,
                        margin: 0, // Grid container의 기본 마진 제거
                        width: '100%', // 너비 100%
                    }}
                >
                    {/* 💡 수정: 보관함 버튼 (Grid xs=6으로 크기 조정) */}
                    <Grid size={{xs:6}} sx={{ p: '0 !important' }}>
                        <Button
                            component={Link}
                            to="/my/favorite"
                            onClick={handleDrawerToggle}
                            color="inherit"
                            aria-label="좋아요"
                            sx={{
                                width: '100%',
                                p: '12px 0',
                                color: TEXT_COLOR,
                                border: `1px solid ${TEXT_COLOR}`,
                                // border: 'none', // 테두리 제거 (요청에 따라)
                                '& .MuiButton-startIcon': { m: 0 } // 아이콘만 남기기 위해 텍스트 제거
                            }}
                            startIcon={<FavoriteBorderOutlinedIcon sx={{ fontSize: '1.5rem' }} />}
                        >
                            {/* 텍스트를 제거하고 아이콘만 남깁니다. */}
                        </Button>
                    </Grid>

                    <Grid size={{xs:6}} sx={{ p: '0 !important' }}>
                        <Button
                            component={Link}
                            to="/my/actives"
                            onClick={handleDrawerToggle}
                            color="inherit"
                            aria-label="내 활동"
                            sx={{
                                width: '100%',
                                p: '12px 0',
                                color: TEXT_COLOR,
                                border: `1px solid ${TEXT_COLOR}`,
                                // border: 'none', // 테두리 제거 (요청에 따라)
                                '& .MuiButton-startIcon': { m: 0 } // 아이콘만 남기기 위해 텍스트 제거
                            }}
                            startIcon={<Inventory2Outlined sx={{ fontSize: '1.5rem' }} />}
                        >
                            {/* 텍스트를 제거하고 아이콘만 남깁니다. */}
                        </Button>
                    </Grid>

                    {/* 💡 수정: 알림 버튼 (Grid xs=6으로 크기 조정) */}
                    <Grid size={{xs:12}} sx={{ p: '0 !important' }}>
                        <Button
                            component={Link}
                            to="/my/alerts"
                            onClick={handleDrawerToggle}
                            color="inherit"
                            aria-label="알림"
                            sx={{
                                width: '100%',
                                p: '12px 0',
                                color: TEXT_COLOR,
                                border: `1px solid ${TEXT_COLOR}`,
                                // border: 'none', // 테두리 제거 (요청에 따라)
                                '& .MuiButton-startIcon': { m: 0 } // 아이콘만 남기기 위해 텍스트 제거
                            }}
                            startIcon={<NotificationsNoneIcon sx={{ fontSize: '1.5rem' }} />}
                        >
                            {/* 텍스트를 제거하고 아이콘만 남깁니다. */}
                        </Button>
                    </Grid>
                </Grid>
                
                {/* 기존 navItems 목록 */}
                {navItems.map((item) => (
                    <ListItem
                        key={item.text}
                        disablePadding
                        component={item.path !== '#' ? Link : 'div'}
                        to={item.path !== '#' ? item.path : null}
                        sx={{
                            textDecoration: 'none',
                            color: 'inherit',
                            // 버튼 목록에 대한 margin 설정
                            margin: '16px 16px',
                            width: 'calc(100% - 32px)',
                            // 로그아웃 버튼의 크기를 xs=12로 조정 (List/ListItem은 이미 Block 요소이므로 width: '100%'로 충분합니다.)
                        }}
                    >
                        {item.isLogout ? (
                            // 💡 수정: 로그아웃 버튼 (xs=12 크기, isUser와 동일한 테두리)
                            <Button
                                onClick={item.onClick ? (e) => { e.preventDefault(); item.onClick(); handleDrawerToggle(); } : undefined}
                                color="inherit"
                                variant="outlined" // isUser와 동일하게 outlined 적용
                                sx={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    p: '8px 16px',
                                    textTransform: 'none',
                                    color: TEXT_COLOR,
                                    borderColor: TEXT_COLOR,
                                    fontWeight: 600, // 사용자명과 동일하게 fontWeight 적용
                                }}
                                aria-label="로그아웃"
                                startIcon={<LogoutIcon sx={{height: '32px'}} />} // 아이콘을 텍스트와 함께 표시
                            >
                                {item.text}
                            </Button>
                        ) : (
                            // 일반 버튼 (로그인, 회원가입, 사용자명)
                            <Button
                                sx={{
                                    color: TEXT_COLOR,
                                    width: '100%',
                                    justifyContent: item.isUser ? 'center' : 'flex-start',
                                    p: item.isUser ? '8px 16px' : 2,
                                    textTransform: 'none',
                                    // 💡 수정: isUser (사용자명)만 테두리 유지, 나머지는 제거
                                    ...((item.isUser) && {
                                        border: `1px solid ${TEXT_COLOR}`,
                                        fontWeight: 600,
                                    }),
                                    ...((item.text === '로그인' || item.text === '회원가입') && {
                                        // 로그인/회원가입은 테두리 제거 후 일반 텍스트 버튼으로 회귀
                                        border: 'none',
                                        fontWeight: 500,
                                        justifyContent: 'center',
                                        p: '8px 16px',
                                    })
                                }}
                                // variant 설정: isUser만 outlined, 나머지는 text
                                variant={item.isUser ? 'outlined' : 'text'}
                                onClick={item.onClick ? (e) => { e.preventDefault(); item.onClick(); handleDrawerToggle(); } : undefined}
                            >
                                <ListItemText primary={item.text} sx={{ textAlign: 'center' }} />
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
                    <Toolbar sx={{ minHeight: '64px', px: { xs: 2, md: 0 } }}>

                        {/* 로고 영역 */}
                        <LogoTypography
                            variant="h6"
                            component={Link}
                            to="/"
                        >
                            BBBB
                        </LogoTypography>

                        <Box sx={{ flexGrow: 1 }} />

                        {/* 데스크톱 (sm 이상) 네비게이션 아이콘 및 버튼 그룹 */}
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: { sm: 1, md: 2 } }}>
                            {isLoggedIn ? (
                                // 로그인 상태: 검색 -> 보관함 아이콘 -> 알림 아이콘 -> 사용자명 버튼 -> 로그아웃 아이콘
                                <>
                                    {/* 검색 아이콘 */}
                                    <IconButton
                                        color="inherit"
                                        onClick={isSearchOpen ? handleSearchClose : () => setIsSearchOpen(true)}
                                    >
                                        {isSearchOpen ? <CloseIcon sx={{ fontSize: '1.7rem' }} /> : <SearchIcon sx={{ fontSize: '1.7rem' }} />}
                                    </IconButton>

                                    {/* 💡 수정: 보관함 아이콘 (테두리 제거 -> IconButton) */}
                                    <IconButton
                                        color="inherit"
                                        component={Link}
                                        to="/my/favorite"
                                        aria-label="좋아요"
                                    >
                                        <FavoriteBorderOutlinedIcon sx={{ fontSize: '1.7rem' }} />
                                    </IconButton>

                                    {/* 💡 수정: 보관함 아이콘 (테두리 제거 -> IconButton) */}
                                    <IconButton
                                        color="inherit"
                                        component={Link}
                                        to="/my/actives"
                                        aria-label="내 활동"
                                    >
                                        <Inventory2Outlined sx={{ fontSize: '1.7rem' }} />
                                    </IconButton>

                                    {/* 💡 수정: 알림 아이콘 (테두리 제거 -> IconButton) */}
                                    <IconButton
                                        color="inherit"
                                        component={Link}
                                        to="/my/alerts"
                                        aria-label="알림"
                                    >
                                        <NotificationsNoneIcon sx={{ fontSize: '1.7rem' }} />
                                    </IconButton>

                                    {/* 💡 수정: 사용자명 버튼 (테두리 유지) */}
                                    <Button
                                        component={Link}
                                        to="/my/page"
                                        variant="outlined"
                                        sx={{
                                            textTransform: 'none',
                                            borderColor: TEXT_COLOR,
                                            color: TEXT_COLOR,
                                            fontWeight: 600,
                                            mr: 1,
                                            '&:hover': {
                                                backgroundColor: alpha(TEXT_COLOR, 0.05),
                                                borderColor: TEXT_COLOR,
                                            }
                                        }}
                                    >
                                        {user.username}
                                    </Button>

                                    {/* 💡 수정: 로그아웃 버튼 (아이콘 버튼, 테두리 제거) */}
                                    <IconButton
                                        color="inherit"
                                        onClick={logout}
                                        aria-label="로그아웃"
                                    >
                                        <LogoutIcon sx={{ fontSize: '1.7rem' }} />
                                    </IconButton>
                                </>
                            ) : (
                                // 비로그인 상태: 검색 -> 회원가입 -> 로그인 (모두 테두리 제거)
                                <>
                                    {/* 검색 아이콘 */}
                                    <IconButton
                                        color="inherit"
                                        onClick={isSearchOpen ? handleSearchClose : () => setIsSearchOpen(true)}
                                        sx={{ mr: 1 }}
                                    >
                                        {isSearchOpen ? <CloseIcon sx={{ fontSize: '1.7rem' }} /> : <SearchIcon sx={{ fontSize: '1.7rem' }} />}
                                    </IconButton>
                                    {/* 💡 수정: 회원가입 (테두리 제거) */}
                                    <Button color="inherit" component={Link} to="/auth/signup" sx={{ fontWeight: 500 }}>
                                        회원가입
                                    </Button>
                                    {/* 💡 수정: 로그인 (테두리 제거) */}
                                    <Button
                                        color="inherit"
                                        sx={{ ml: 2, fontWeight: 500 }}
                                        component={Link}
                                        to='/auth/signin'
                                    >
                                        로그인
                                    </Button>
                                </>
                            )}
                        </Box>

                        {/* 모바일 (xs) 아이콘 그룹: 검색, 메뉴 아이콘만 표시 */}
                        <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
                            {/* 검색/닫기 아이콘 버튼 */}
                            <IconButton
                                color="inherit"
                                onClick={isSearchOpen ? handleSearchClose : () => setIsSearchOpen(true)}
                                sx={{ mr: 1, p: 1 }}
                            >
                                {isSearchOpen ? (
                                    <CloseIcon sx={{ fontSize: '1.7rem' }} />
                                ) : (
                                    <SearchIcon sx={{ fontSize: '1.7rem' }} />
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
                                <MenuIcon sx={{ fontSize: '1.7rem' }} />
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
                            sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <SearchInput
                                placeholder="검색어를 입력하세요."
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
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
        </>
    );
};

export default Navigation;