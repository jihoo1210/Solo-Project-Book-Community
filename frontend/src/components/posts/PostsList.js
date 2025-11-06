// src/components/PostsList.js

import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    Tabs, Tab, Chip, Pagination,
    TextField, InputAdornment, IconButton, Menu, MenuItem,
    CircularProgress
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import apiClient from '../../api/Api-Service';

// 상수 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';
const HEADER_HEIGHT = '64px';
// 🛠️ 좋아요 버튼과 동일한 보라색 상수 추가
const PURPLE_COLOR = '#9c27b0';
const RED_COLOR = '#F44336'; // 기존 좋아요 아이콘 색상을 명확히 정의

// 스타일 컴포넌트 정의
const PostsListWrapper = styled(Box)(({ theme }) => ({
    marginTop: HEADER_HEIGHT,
    backgroundColor: BG_COLOR,
    padding: theme.spacing(4, 0),
}));

// (중략: PostsCard, ActionButton, CustomSearchField, FilterButton, CustomTableCell, StyledChip 스타일은 변경 없음)

const PostsCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: (theme.shape?.borderRadius || 4) * 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: `1px solid ${TEXT_COLOR}`,
    backgroundColor: BG_COLOR,

    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2, 0),
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    color: BG_COLOR,
    backgroundColor: TEXT_COLOR,
    fontWeight: 600,
    padding: theme.spacing(1, 3),
    '&:hover': { backgroundColor: LIGHT_TEXT_COLOR },
}));

const CustomSearchField = styled(TextField)(({ theme }) => ({
    minWidth: 150,
    '& .MuiInputLabel-root': { color: LIGHT_TEXT_COLOR },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: TEXT_COLOR },
        '&:hover fieldset': { borderColor: TEXT_COLOR },
        '&.Mui-focused fieldset': {
            borderColor: TEXT_COLOR,
            borderWidth: '1px',
        },
    },
}));

const FilterButton = styled(Button)(({ theme }) => ({
    color: TEXT_COLOR,
    borderColor: TEXT_COLOR,
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    minWidth: 'auto',
    whiteSpace: 'nowrap',
    '&:hover': {
        borderColor: TEXT_COLOR,
        backgroundColor: alpha(TEXT_COLOR, 0.05),
    }
}));


const CustomTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 700,
    color: TEXT_COLOR,
    backgroundColor: alpha(TEXT_COLOR, 0.03),
    borderBottom: `1px solid ${TEXT_COLOR}`,
    fontSize: '1rem',
    [theme.breakpoints.down('sm')]: {
        display: 'none', // 모바일에서 테이블 헤더 숨김
    },
}));


const StyledChip = styled(Chip)(({ theme, subject }) => {
    let chipColor;
    switch (subject) {
        case '질문': chipColor = '#FFC107'; break;
        case '모집': chipColor = '#4CAF50'; break;
        case '공유': default: chipColor = '#2196F3'; break;
    }
    return {
        backgroundColor: chipColor,
        color: BG_COLOR,
        fontWeight: 600,
        fontSize: '0.75rem',
        height: '24px',
    };
});

/**
 * 🛠️ 작성일 형식 복원: 날짜를 조건부로 포매팅하는 함수 (오늘: HH:MM, 그 외: MM/DD)
 */
const formatDate = (dateString) => {
    const postDate = new Date(dateString);
    const today = new Date();

    // 날짜 비교를 위해 시, 분, 초를 0으로 설정
    const postDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // 1. 날짜가 오늘과 같을 경우: "시간:분" (예: 10:05)
    if (postDay.getTime() === todayDay.getTime()) {
        const hours = String(postDate.getHours()).padStart(2, '0');
        const minutes = String(postDate.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    } 
    // 2. 날짜가 오늘과 다를 경우: "월/일" (예: 11/04)
    else {
        const month = String(postDate.getMonth() + 1).padStart(2, '0');
        const day = String(postDate.getDate()).padStart(2, '0');
        return `${month}/${day}`;
    }
};


const PostsList = () => {
    // useNavigate 훅 선언
    const navigate = useNavigate();

    // API 연동 및 데이터 관련 상태
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPosts, setTotalPosts] = useState(0); // 페이지네이션에 사용될 전체 게시글 수

    // 필터링, 정렬, 페이지네이션 상태
    const [selectedTab, setSelectedTab] = useState(0); // 0: 전체, 1: 질문, 2: 공유, 3: 모집
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState(''); // 💡 API 호출에 사용되는 실제 검색어 상태 (유지)
    const [pendingSearchTerm, setPendingSearchTerm] = useState(''); // 💡 입력 필드에 바인딩되는 임시 검색어 상태 (유지)
    const [sortOrder, setSortOrder] = useState('desc'); // 정렬 순서 ('desc' 또는 'asc')
    const [searchField, setSearchField] = useState('제목'); // 검색 필드 ('제목', '작성자', '내용')
    const [rowsPerPage, setRowsPerPage] = useState(10); // 🌟 rowsPerPage를 상태로 변경 (기본값 10)

    // 메뉴 Anchor 상태
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const openSortMenu = Boolean(sortAnchorEl);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const openFilterMenu = Boolean(filterAnchorEl);
    const [perPageAnchorEl, setPerPageAnchorEl] = useState(null); // 🌟 페이지당 항목 수 메뉴 상태 추가
    const openPerPageMenu = Boolean(perPageAnchorEl); // 🌟 페이지당 항목 수 메뉴 열림 상태

    // 게시글 목록 API 호출 로직
    useEffect(() => {
        const fetchPosts = async (currentPage, currentTab, currentSortOrder, currentRowsPerPage, currentSearchField, currentSearchTerm) => {
            setIsLoading(true);
            setError(null);

            const pageNumberForBackend = currentPage - 1; // 백엔드는 보통 0부터 시작
            const sortParam = `id,${currentSortOrder}`;
            const searchFieldParam = `searchField=${currentSearchField}`;
            const searchTermParam = `searchTerm=${currentSearchTerm}`;
            // 탭 필터링 (0은 '전체'이므로 필터링하지 않음)
            const tabParam = currentTab > 0 ? `&tab=${currentTab}` : '';

            // 🌟 API URL에 currentRowsPerPage (변경된 rowsPerPage 상태) 반영
            const url = `/posts?page=${pageNumberForBackend}&size=${currentRowsPerPage}&sort=${sortParam}&${searchFieldParam}&${searchTermParam}${tabParam}`;

            try {
                const response = await apiClient.get(url);
                const result = response.data.result;

                    if (result && result.content && Array.isArray(result.content)) {
                        // Spring Page 객체 구조인 경우 처리
                        const newPosts = result.content;
                        const newTotalPosts = result.totalElements || 0; // totalElements를 통해 전체 게시글 수 확보

                        setPosts(newPosts);
                        setTotalPosts(newTotalPosts);
                    } else {
                        // 응답은 왔으나 내용이 없거나 예상치 못한 구조인 경우
                        setPosts([]);
                        setTotalPosts(0);
                    }

            } catch (error) {
                const errorMsg = error.response?.data?.message || "게시글을 불러오는 중 오류가 발생했습니다.";
                console.error("게시글 로드 오류:", errorMsg);
                setError(errorMsg);
                setPosts([]);
                setTotalPosts(0);
            } finally {
                setIsLoading(false);
            }
        };

        // 종속성 배열의 상태가 변경될 때마다 API 호출
        // 🌟 rowsPerPage 상태를 fetchPosts 함수 호출 인자로 전달
        fetchPosts(page, selectedTab, sortOrder, rowsPerPage, searchField, searchTerm);

    // 🌟 rowsPerPage를 종속성 배열에 추가하여 변경 시 API 재요청
    }, [page, selectedTab, sortOrder, searchField, searchTerm, rowsPerPage]);

    // 이벤트 핸들러
    const handleSortClick = (event) => { setSortAnchorEl(event.currentTarget); };
    const handleSortClose = () => { setSortAnchorEl(null); };
    const handleSortOptionSelect = (order) => {
        setSortOrder(order);
        setPage(1); // 정렬 변경 시 1페이지로 초기화
        setSortAnchorEl(null);
    };

    const handleFilterClick = (event) => { setFilterAnchorEl(event.currentTarget); };
    const handleFilterClose = () => { setFilterAnchorEl(null); };
    const handleFilterOptionSelect = (field) => {
        setSearchField(field);
        setPage(1); // 검색 필드 변경 시 1페이지로 초기화
        setFilterAnchorEl(null);
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
        setPage(1); // 탭 변경 시 1페이지로 초기화
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    /**
     * 🌟 페이지당 항목 수 메뉴 핸들러 추가
     */
    const handlePerPageClick = (event) => { setPerPageAnchorEl(event.currentTarget); };
    const handlePerPageClose = () => { setPerPageAnchorEl(null); };
    const handlePerPageSelect = (value) => {
        setRowsPerPage(value);
        setPage(1); // 항목 수 변경 시 1페이지로 초기화
        setPerPageAnchorEl(null);
    };

    /**
     * 💡 검색 버튼/아이콘 클릭 시 검색 실행 핸들러 (유지)
     */
    const handleSearchSubmit = () => {
        setSearchTerm(pendingSearchTerm); // 임시 검색어를 실제 검색어 상태에 반영
        setPage(1); // 검색 실행 시 1페이지로 초기화
    };

    /**
     * TableRow 클릭 핸들러 (유지)
     */
    const handleRowClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    // 전체 게시글 수와 페이지당 행 수를 기반으로 페이지 수 계산
    const pageCount = Math.ceil(totalPosts / rowsPerPage);

    // 모바일 뷰에서 사용할 레이블 및 스타일 (좋아요, 조회수 추가)
    const mobileLabels = ['ID', '주제', '제목', '작성자', '좋아요', '조회수', '작성일'];
    const labelStyles = { fontWeight: 'bold', color: TEXT_COLOR, minWidth: '60px', marginRight: '8px' };

    return (
        <PostsListWrapper>
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    align="left"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 4, color: TEXT_COLOR, fontSize: { xs: '2rem', md: '2.5rem' }, display: {xs: 'none', sm: 'block'} }}
                >
                    게시판
                </Typography>
                <PostsCard elevation={0}>
                    <Box
                        sx={(theme) => ({
                            display: 'flex',
                            flexDirection: 'column',
                            mb: 3,
                            gap: 2,
                            [theme.breakpoints.down('sm')]: {
                                padding: theme.spacing(0, 2),
                            },
                        })}
                    >
                        {/* 탭 네비게이션 */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: { xs: 'flex-start', md: 'flex-start' },
                            overflowX: { xs: 'auto', md: 'visible' },
                            '&::-webkit-scrollbar': { display: 'none' },
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                        }}>
                            <Tabs
                                value={selectedTab}
                                onChange={handleTabChange}
                                aria-label="게시글 주제 탭"
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    '& .MuiTabs-indicator': { backgroundColor: TEXT_COLOR },
                                    '& .MuiTabs-flexContainer': { minWidth: 'fit-content' },
                                }}
                            >
                                <Tab label="전체" value={0} sx={{ color: TEXT_COLOR, fontWeight: 600, flexShrink: 0 }} />
                                <Tab label="질문" value={1} sx={{ color: TEXT_COLOR, fontWeight: 600, flexShrink: 0 }} />
                                <Tab label="공유" value={2} sx={{ color: TEXT_COLOR, fontWeight: 600, flexShrink: 0 }} />
                                <Tab label="모집" value={3} sx={{ color: TEXT_COLOR, fontWeight: 600, flexShrink: 0 }} />
                            </Tabs>
                        </Box>

                        {/* 정렬, 검색, 글쓰기 버튼 영역 */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 2,
                        }}>
                            <Box sx={{
                                display: 'flex',
                                gap: 1,
                                width: { xs: '100%', md: 'auto' },
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: { xs: 'flex-start', md: 'flex-start' },
                                alignItems: { xs: 'flex-start', md: 'center' }
                            }}>
                                {/* 정렬 및 검색 필터 버튼 그룹 */}
                                <Box sx={{
                                    display: 'flex',
                                    gap: 1,
                                    width: { xs: '100%', md: 'auto' },
                                    justifyContent: 'flex-start',
                                }}>
                                    {/* 정렬 버튼 */}
                                    <FilterButton
                                        variant="outlined"
                                        endIcon={sortOrder === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                                        onClick={handleSortClick}
                                        aria-controls={openSortMenu ? 'sort-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={openSortMenu ? 'true' : undefined}
                                        sx={{ flex: { xs: 1, md: 'none' } }}
                                    >
                                        {sortOrder === 'desc' ? '내림차순' : '오름차순'}
                                    </FilterButton>
                                    {/* 정렬 메뉴 */}
                                    <Menu
                                        anchorEl={sortAnchorEl}
                                        open={openSortMenu}
                                        onClose={handleSortClose}
                                        id="sort-menu"
                                        slotProps={{
                                            paper: {
                                                sx: {
                                                    border: `1px solid ${TEXT_COLOR}`,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem onClick={() => handleSortOptionSelect('desc')}>내림차순</MenuItem>
                                        <MenuItem onClick={() => handleSortOptionSelect('asc')}>오름차순</MenuItem>
                                    </Menu>

                                    {/* 검색 필드 선택 버튼 */}
                                    <FilterButton
                                        variant="outlined"
                                        endIcon={<SortIcon />}
                                        onClick={handleFilterClick}
                                        aria-controls={openFilterMenu ? 'filter-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={openFilterMenu ? 'true' : undefined}
                                        sx={{ flex: { xs: 1, md: 'none' } }}
                                    >
                                        {searchField}
                                    </FilterButton>
                                    {/* 검색 필드 메뉴 */}
                                    <Menu
                                        anchorEl={filterAnchorEl}
                                        open={openFilterMenu}
                                        onClose={handleFilterClose}
                                        id="filter-menu"
                                        slotProps={{
                                            paper: {
                                                sx: {
                                                    border: `1px solid ${TEXT_COLOR}`,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem onClick={() => handleFilterOptionSelect('제목')}>제목</MenuItem>
                                        <MenuItem onClick={() => handleFilterOptionSelect('작성자')}>작성자</MenuItem>
                                        <MenuItem onClick={() => handleFilterOptionSelect('내용')}>내용</MenuItem>
                                    </Menu>
                                </Box>

                                {/* 검색 입력 필드 */}
                                <CustomSearchField
                                    label={`검색 (${searchField})`}
                                    variant="outlined"
                                    size="small"
                                    value={pendingSearchTerm} // 💡 임시 상태에 바인딩 (유지)
                                    onChange={(e) => {
                                        setPendingSearchTerm(e.target.value); // 💡 임시 상태만 업데이트 (유지)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchSubmit(); // Enter 키 입력 시 검색 실행 (유지)
                                        }
                                    }}
                                    sx={{ minWidth: { xs: '100%', md: '200px' }, flexGrow: 1, mt: { xs: 1, md: 0 }, color: {xs: LIGHT_TEXT_COLOR} }}
                                    slotProps={{ 
                                        input: {endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton 
                                                    sx={{ color: TEXT_COLOR }} 
                                                    edge="end"
                                                    onClick={handleSearchSubmit} // 💡 검색 아이콘 클릭 시 검색 실행 (유지)
                                                >
                                                    <SearchIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                }
                                />
                                {/* 🌟 몇 개씩 보여줄지 선택 메뉴 (Rows Per Page) 추가 */}
                                <FilterButton
                                    variant="outlined"
                                    onClick={handlePerPageClick}
                                    aria-controls={openPerPageMenu ? 'per-page-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={openPerPageMenu ? 'true' : undefined}
                                    sx={{ width: { xs: '100%', md: '100px' } }}
                                >
                                    {rowsPerPage}개씩 보기
                                </FilterButton>
                                {/* Rows Per Page 메뉴 */}
                                <Menu
                                    anchorEl={perPageAnchorEl}
                                    open={openPerPageMenu}
                                    onClose={handlePerPageClose}
                                    id="per-page-menu"
                                    slotProps={{
                                        paper: {
                                            sx: {
                                                border: `1px solid ${TEXT_COLOR}`,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            },
                                        },
                                    }}
                                >
                                    {[10, 15, 30, 50].map((count) => (
                                        <MenuItem 
                                            key={count} 
                                            onClick={() => handlePerPageSelect(count)}
                                            selected={count === rowsPerPage}
                                        >
                                            {count}개씩 보기
                                        </MenuItem>
                                    ))}
                                </Menu>
                                {/* 🌟 추가 끝 */}
                            </Box>

                            {/* 글쓰기 버튼 */}
                            <ActionButton
                                variant="contained"
                                component={Link}
                                to="/post/create"
                                sx={{ width: { xs: '100%', md: 'auto' } }}
                            >
                                글쓰기
                            </ActionButton>
                        </Box>
                    </Box>

                    {/* 게시글 테이블 */}
                    <TableContainer component={Paper} elevation={0}
                        sx={(theme) => ({
                            border: `1px solid ${TEXT_COLOR}`,
                            [theme.breakpoints.down('sm')]: {
                                marginX: theme.spacing(2),
                                width: `calc(100% - ${theme.spacing(4)})`,
                            },
                        })}
                    >
                        <Table aria-label="게시글 목록">
                            <TableHead>
                                <TableRow>
                                    {/* TableCell들을 한 줄에 붙여서 작성하여 whitespace text node 제거 */}
                                    <CustomTableCell sx={{ width: '5%' }}>ID</CustomTableCell><CustomTableCell sx={{ width: '8%' }}>주제</CustomTableCell><CustomTableCell sx={{ width: '35%' }}>제목</CustomTableCell><CustomTableCell sx={{ width: '15%' }}>작성자</CustomTableCell><CustomTableCell sx={{ width: '10%' }}>좋아요</CustomTableCell><CustomTableCell sx={{ width: '10%' }}>조회수</CustomTableCell><CustomTableCell sx={{ width: '17%' }}>작성일</CustomTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* 로딩 상태 */}
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5 }}>
                                            <CircularProgress sx={{ color: TEXT_COLOR }} size={30} />
                                            <Typography variant="body1" sx={{ mt: 1, color: LIGHT_TEXT_COLOR }}>게시글을 불러오는 중...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    /* 에러 상태 */
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5 }}>
                                            <Typography variant="body1" color="error">{error}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : posts.length === 0 ? (
                                    /* 게시글 없음 상태 */
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5 }}>
                                            <Typography variant="body1" sx={{ color: LIGHT_TEXT_COLOR }}>
                                                {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '게시글이 없습니다.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // 게시글 목록 렌더링
                                    posts.map((post) => (
                                        <TableRow
                                            key={post.id}
                                            onClick={() => handleRowClick(post.id)} // 클릭 핸들러 유지
                                            sx={(theme) => ({
                                                textDecoration: 'none',
                                                '& > .MuiTableCell-root': { borderBottom: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` },
                                                '&:last-child > .MuiTableCell-root': { borderBottom: 'none' },
                                                '&:hover': {
                                                    backgroundColor: alpha(TEXT_COLOR, 0.05),
                                                    cursor: 'pointer' // 클릭 가능함을 표시
                                                },
                                                [theme.breakpoints.down('sm')]: {
                                                    display: 'block',
                                                    borderBottom: `1px solid ${TEXT_COLOR} !important`,
                                                    padding: theme.spacing(1, 0),
                                                    '& > .MuiTableCell-root': { borderBottom: 'none !important' },
                                                }
                                            })}
                                        >
                                            {/* TableCell들 사이의 줄 바꿈을 제거하여 whitespace text node 제거 */}
                                            {/* ID */}
                                            <TableCell component="th" scope="row"
                                                sx={(theme) => ({
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        fontSize: '0.8rem',
                                                        color: LIGHT_TEXT_COLOR,
                                                        padding: theme.spacing(0, 2, 0.5, 2),
                                                        order: 7,
                                                        '&::before': { content: `'${mobileLabels[0]}: '`, ...labelStyles }
                                                    }
                                                })}
                                            >{post.id}</TableCell>
                                            {/* 주제 */}
                                            <TableCell
                                                sx={(theme) => ({
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'flex',
                                                        justifyContent: 'flex-start',
                                                        padding: theme.spacing(0.5, 2, 0, 2),
                                                        order: 2,
                                                    }
                                                })}
                                            >
                                                <StyledChip label={post.subject} subject={post.subject} size="small" />
                                            </TableCell>
                                            {/* 제목 */}
                                            <TableCell sx={(theme) => ({
                                                fontWeight: 600, color: TEXT_COLOR,
                                                [theme.breakpoints.down('sm')]: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    fontSize: '1rem',
                                                    padding: theme.spacing(1, 2, 0.5, 2),
                                                    order: 1,
                                                    whiteSpace: 'normal',
                                                    wordBreak: 'break-word',
                                                }
                                            })}>
                                                <Box component="span" sx={{ flexGrow: 1, minWidth: 0 }}>
                                                    {post.title}
                                                </Box>
                                            </TableCell>
                                            {/* 작성자 */}
                                            <TableCell sx={(theme) => ({
                                                color: LIGHT_TEXT_COLOR,
                                                [theme.breakpoints.down('sm')]: {
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    fontSize: '0.85rem',
                                                    padding: theme.spacing(0.5, 2, 0.5, 2),
                                                    order: 3,
                                                    '&::before': { content: `'${mobileLabels[3]}: '`, ...labelStyles }
                                                }
                                            })}>{post.username}</TableCell>
                                            {/* 좋아요 수 (추가) */}
                                            <TableCell sx={(theme) => ({
                                                // 🛠️ savedInLikes 값에 따라 색상을 동적으로 변경 (데스크탑 뷰)
                                                color: post.savedInLikes ? PURPLE_COLOR : RED_COLOR,
                                                fontWeight: 600,
                                                [theme.breakpoints.down('sm')]: {
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    fontSize: '0.85rem',
                                                    padding: theme.spacing(0.5, 2, 0.5, 2),
                                                    order: 5,
                                                    color: LIGHT_TEXT_COLOR,
                                                    fontWeight: 400,
                                                    '&::before': { content: `'${mobileLabels[4]}: '`, ...labelStyles }
                                                }
                                            })}>
                                                {/* 🛠️ 아이콘 색상도 savedInLikes 값에 따라 동적으로 변경 */}
                                                <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, mr: 0.5, mt: 0.2 }}>
                                                    <FavoriteIcon 
                                                        sx={{ 
                                                            fontSize: '1rem', 
                                                            verticalAlign: 'middle', 
                                                            // 🛠️ savedInLikes가 true이면 PURPLE_COLOR, 아니면 RED_COLOR
                                                            color: post.savedInLikes ? PURPLE_COLOR : RED_COLOR 
                                                        }} 
                                                    />
                                                </Box>
                                                {post.likes || 0}
                                            </TableCell>
                                            {/* 조회수 (추가) */}
                                            <TableCell sx={(theme) => ({
                                                color: LIGHT_TEXT_COLOR,
                                                [theme.breakpoints.down('sm')]: {
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    fontSize: '0.85rem',
                                                    padding: theme.spacing(0.5, 2, 0.5, 2),
                                                    order: 6,
                                                    '&::before': { content: `'${mobileLabels[5]}: '`, ...labelStyles }
                                                }
                                            })}>
                                                <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, mr: 0.5, mt: 0.2 }}>
                                                    <VisibilityIcon sx={{ fontSize: '1rem', verticalAlign: 'middle' }} />
                                                </Box>
                                                {post.viewCount || 0}
                                            </TableCell>
                                            {/* 작성일 🛠️ (formatDate 조건부 로직 복원 적용) */}
                                            <TableCell sx={(theme) => ({
                                                color: LIGHT_TEXT_COLOR,
                                                [theme.breakpoints.down('sm')]: {
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    fontSize: '0.85rem',
                                                    padding: theme.spacing(0.5, 2, 0.5, 2),
                                                    order: 4,
                                                    '&::before': { content: `'${mobileLabels[6]}: '`, ...labelStyles }
                                                }
                                            })}>{formatDate(post.modifiedDate)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* 페이지네이션 컴포넌트 */}
                    {pageCount > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={pageCount}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                sx={{
                                    '& .MuiPaginationItem-root.Mui-selected': {
                                        backgroundColor: TEXT_COLOR,
                                        color: BG_COLOR,
                                        '&:hover': { backgroundColor: LIGHT_TEXT_COLOR }
                                    },
                                    '& .MuiPaginationItem-root': { color: TEXT_COLOR }
                                }}
                            />
                        </Box>
                    )}
                </PostsCard>
            </Container>
        </PostsListWrapper>
    );
};

export default PostsList;