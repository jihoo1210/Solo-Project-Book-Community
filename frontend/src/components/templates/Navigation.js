import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, Container, InputBase,
    IconButton, Drawer, List, ListItem, ListItemText, Slide
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'; // useAuth 임포트

// 1. 색상 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555'; // LIGHT_TEXT_COLOR 정의 추가 (일관성 유지)

// 2. AppBar 커스텀 스타일
const ModernAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: BG_COLOR,
    boxShadow: 'none',
    borderBottom: `1px solid ${TEXT_COLOR}`,
    color: TEXT_COLOR,
    zIndex: theme.zIndex.drawer + 1,
}));

// 3. 로고 타이포그래피 커스텀 스타일
const LogoTypography = styled(Typography)(({ theme }) => ({
    fontFamily: 'Roboto, Arial, sans-serif',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: TEXT_COLOR,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    flexGrow: 1,
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


// 4. 오버레이 검색 영역 스타일
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

// 5. 검색 입력 필드 스타일
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
    // [수정] logout 함수를 useAuth에서 가져옴
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

    // [수정] navItems에 로그아웃 항목 추가
    const navItems = isLoggedIn ?
        [
            // 사용자 정보 버튼
            { text: user.username, path: '/mypage', isUser: true }, 
            // 로그아웃 버튼 (onClick 속성 추가)
            { text: '로그아웃', path: '#', onClick: logout, isLogout: true } 
        ] :
        [
            { text: '회원가입', path: '/auth/signup' },
            { text: '로그인', path: '/auth/signin' }
        ];


    // 사이드바 내용 컴포넌트
    const drawer = (
        <Box
            onClick={handleDrawerToggle} // 메뉴 항목 클릭 시 사이드바 닫기
            sx={{ width: 250, bgcolor: BG_COLOR, height: '100%' }}
        >
            <Toolbar />
            <List>
                {navItems.map((item) => (
                    <ListItem
                        key={item.text}
                        disablePadding
                        // [수정] path가 '#'이면 div로 렌더링하여 Link 동작을 막고, onClick을 사용합니다.
                        component={item.path !== '#' ? Link : 'div'}
                        to={item.path !== '#' ? item.path : null}
                        sx={{
                            // Link 컴포넌트의 기본 텍스트 데코레이션을 제거합니다.
                            textDecoration: 'none',
                            color: 'inherit',
                            // 로그인/로그아웃 버튼 스타일링을 위한 조건부 margin 조정
                            ...((item.text === '로그인' || item.isLogout) && {
                                margin: '0 16px 8px 16px', // 좌우 마진 추가
                                width: 'calc(100% - 32px)',
                            })
                        }}
                    >
                        <Button
                            sx={{
                                color: TEXT_COLOR,
                                width: '100%',
                                justifyContent: 'flex-start',
                                p: 2,
                                // 로그인/로그아웃 버튼만 variant="outlined" 스타일 시뮬레이션
                                ...((item.text === '로그인' || item.isLogout) && {
                                    border: `1px solid ${TEXT_COLOR}`,
                                    fontWeight: 600,
                                })
                            }}
                            variant={item.isUser ? 'text' : ((item.text === '로그인' || item.isLogout) ? 'outlined' : 'text')}
                            // [수정] 로그아웃 버튼의 경우 onClick 이벤트 처리
                            onClick={item.onClick ? (e) => { e.preventDefault(); item.onClick(); handleDrawerToggle(); } : undefined}
                        >
                            <ListItemText primary={item.text} />
                        </Button>
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

                        {/* 1. 로고 영역 - Link 사용 */}
                        <LogoTypography
                            variant="h6"
                            component={Link}
                            to="/"
                        >
                            BBBB
                        </LogoTypography>

                        {/* 2. 메뉴 및 아이콘 영역 */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>

                            {/* 검색/닫기 아이콘 버튼 (생략) */}
                            <IconButton
                                color="inherit"
                                onClick={isSearchOpen ? handleSearchClose : () => setIsSearchOpen(true)}
                                sx={{
                                    mr: { xs: 2 },
                                    p: { xs: 1, sm: 'auto' }
                                }}
                            >
                                {isSearchOpen ? (
                                    <CloseIcon sx={{ fontSize: '1.7rem' }} />
                                ) : (
                                    <SearchIcon sx={{ fontSize: '1.7rem' }} />
                                )}
                            </IconButton>

                            {/* 햄버거 메뉴 버튼 (모바일) (생략) */}
                            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    edge="end"
                                    onClick={handleDrawerToggle}
                                >
                                    <MenuIcon sx={{ fontSize: '1.7rem' }} />
                                </IconButton>
                            </Box>

                            {/* [수정] 회원가입/로그인/사용자명/로그아웃 버튼 (데스크톱) - 조건부 렌더링 적용 */}
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 3 }}>
                                {isLoggedIn ? (
                                    <>
                                        {/* 사용자명 버튼 */}
                                        <Button
                                            color="inherit"
                                            component={Link}
                                            to="/mypage"
                                        >
                                            {user.username}
                                        </Button>
                                        {/* 로그아웃 버튼 */}
                                        <Button
                                            variant="outlined"
                                            sx={{ color: TEXT_COLOR, borderColor: TEXT_COLOR, fontWeight: 600 }}
                                            onClick={logout} // Context의 logout 함수 연결
                                        >
                                            로그아웃
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {/* 회원가입 버튼 */}
                                        <Button
                                            color="inherit"
                                            component={Link}
                                            to="/auth/signup"
                                        >
                                            회원가입
                                        </Button>
                                        {/* 로그인 버튼 */}
                                        <Button
                                            variant="outlined"
                                            sx={{ color: TEXT_COLOR, borderColor: TEXT_COLOR, fontWeight: 600 }}
                                            component={Link}
                                            to='/auth/signin'
                                        >
                                            로그인
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Toolbar>
                </Container>
            </ModernAppBar>

            {/* ... 토글 검색 오버레이 (생략) */}
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

            {/* 토글 사이드바 (생략) */}
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