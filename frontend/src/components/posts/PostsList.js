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
import { 
    BG_COLOR, TEXT_COLOR, LIGHT_TEXT_COLOR, 
    PURPLE_COLOR, RED_COLOR, MODIFIED_COLOR, VIEW_SAVED_COLOR, NEW_COLOR, HEADER_HEIGHT
} from '../constants/Theme';
import { getPostDateInfo } from '../utilities/DateUtiles';

// 스타일 컴포넌트 정의
const PostsListWrapper = styled(Box)(({ theme }) => ({
    marginTop: HEADER_HEIGHT,
    backgroundColor: BG_COLOR,
    padding: theme.spacing(4, 0),
}));

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

const CustomTab = styled(Tab)(({ theme }) => ({
    color: TEXT_COLOR,
    fontWeight: 600,
    flexShrink: 1,
    minWidth: '80px',
    padding: '12px 16px',
    [theme.breakpoints.down('sm')]: {
        minWidth: '25%',
        padding: 0,
    }
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
    color: `${LIGHT_TEXT_COLOR} !important`,
    '& .MuiInputLabel-root': { color: `${LIGHT_TEXT_COLOR} !important` },
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
        display: 'none',
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

const PostsList = () => {
    const navigate = useNavigate();

    // API 연동 및 데이터 관련 상태
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPosts, setTotalPosts] = useState(0);

    // 필터링, 정렬, 페이지네이션 상태
    const [selectedTab, setSelectedTab] = useState(0);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingSearchTerm, setPendingSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchField, setSearchField] = useState('제목');
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // 메뉴 Anchor 상태
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const openSortMenu = Boolean(sortAnchorEl);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const openFilterMenu = Boolean(filterAnchorEl);
    const [perPageAnchorEl, setPerPageAnchorEl] = useState(null);
    const openPerPageMenu = Boolean(perPageAnchorEl);

    /**
     * 게시글 목록 API 호출 로직
     */
    useEffect(() => {
        const fetchPosts = async (currentPage, currentTab, currentSortOrder, currentRowsPerPage, currentSearchField, currentSearchTerm, isMyMode) => {
            setIsLoading(true);
            setError(null);

            const pageNumberForBackend = currentPage - 1;
            const sortParam = `id,${currentSortOrder}`;
            const searchFieldParam = `searchField=${currentSearchField}`;
            const searchTermParam = `searchTerm=${currentSearchTerm}`;
            // 탭 필터링 (0은 '전체'이므로 필터링하지 않음)
            const tabParam = currentTab > 0 ? `&tab=${currentTab}` : '';

            // API 엔드포인트는 항상 일반 게시판 경로인 '/posts' 사용
            const baseUrl = '/posts'; 

            // API URL에 currentRowsPerPage (페이지당 항목 수) 반영
            const url = `${baseUrl}?page=${pageNumberForBackend}&size=${currentRowsPerPage}&sort=${sortParam}&${searchFieldParam}&${searchTermParam}${tabParam}`;

            try {
                const response = await apiClient.get(url);
                const result = response.data.result;

                if (result && result.content && Array.isArray(result.content)) {
                    // Spring Page 객체 구조 처리
                    setPosts(result.content);
                    setTotalPosts(result.totalElements || 0);
                } else {
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

        // 상태가 변경될 때마다 API 호출
        fetchPosts(page, selectedTab, sortOrder, rowsPerPage, searchField, searchTerm);

    }, [page, selectedTab, sortOrder, searchField, searchTerm, rowsPerPage]);

    // 이벤트 핸들러
    const handleSortClick = (event) => { setSortAnchorEl(event.currentTarget); };
    const handleSortClose = () => { setSortAnchorEl(null); };
    const handleSortOptionSelect = (order) => {
        setSortOrder(order);
        setPage(1);
        setSortAnchorEl(null);
    };

    const handleFilterClick = (event) => { setFilterAnchorEl(event.currentTarget); };
    const handleFilterClose = () => { setFilterAnchorEl(null); };
    const handleFilterOptionSelect = (field) => {
        setSearchField(field);
        setPage(1);
        setFilterAnchorEl(null);
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
        setPage(1);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    // 페이지당 항목 수 메뉴 핸들러
    const handlePerPageClick = (event) => { setPerPageAnchorEl(event.currentTarget); };
    const handlePerPageClose = () => { setPerPageAnchorEl(null); };
    const handlePerPageSelect = (value) => {
        setRowsPerPage(value);
        setPage(1);
        setPerPageAnchorEl(null);
    };

    // 검색 실행 핸들러
    const handleSearchSubmit = () => {
        setSearchTerm(pendingSearchTerm);
        setPage(1);
    };

    // TableRow 클릭 핸들러
    const handleRowClick = (postId) => {
        navigate(`/post/${postId}?from=default`);
    };

    // 전체 게시글 수와 페이지당 행 수를 기반으로 페이지 수 계산
    const pageCount = Math.ceil(totalPosts / rowsPerPage);

    // 모바일 뷰에서 사용할 레이블 및 스타일
    const mobileLabels = ['ID', '주제', '제목', '작성자', '좋아요', '조회수', '작성일'];
    const labelStyles = { fontWeight: 'bold', color: TEXT_COLOR, minWidth: '60px', marginRight: '8px' };

    return (
        <PostsListWrapper>
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    align="left"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 4, color: TEXT_COLOR, fontSize: { xs: '2rem', md: '2.5rem' }, textAlign: {xs: 'center', md: 'left'} }}
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
                            overflowX: { xs: 'hidden', md: 'visible' },
                        }}>
                            <Tabs
                                value={selectedTab}
                                onChange={handleTabChange}
                                aria-label="게시글 주제 탭"
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    width: { xs: '100%', md: 'auto' },
                                    '& .MuiTabs-indicator': { backgroundColor: TEXT_COLOR },
                                    '& .MuiTabs-flexContainer': {
                                        minWidth: { xs: '100%', md: 'fit-content' },
                                    },
                                    overflowX: 'hidden',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none',
                                }}
                            >
                                <CustomTab label="전체" value={0} />
                                <CustomTab label="질문" value={1} />
                                <CustomTab label="공유" value={2} />
                                <CustomTab label="모집" value={3} />
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
                                    value={pendingSearchTerm}
                                    onChange={(e) => {
                                        setPendingSearchTerm(e.target.value);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchSubmit();
                                        }
                                    }}
                                    sx={{ minWidth: { xs: '100%', md: '200px' }, flexGrow: 1, mt: { xs: 1, md: 0 }, color: LIGHT_TEXT_COLOR }}
                                    slotProps={{
                                        input: {endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    sx={{ color: TEXT_COLOR }}
                                                    edge="end"
                                                    onClick={handleSearchSubmit}
                                                >
                                                    <SearchIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                }
                                />
                                {/* 몇 개씩 보여줄지 선택 메뉴 (Rows Per Page) */}
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
                                    <CustomTableCell sx={{ width: '5%' }}>ID</CustomTableCell>
                                    <CustomTableCell sx={{ width: '8%' }}>주제</CustomTableCell>
                                    <CustomTableCell sx={{ width: '42%' }}>제목</CustomTableCell>
                                    <CustomTableCell sx={{ width: '15%' }}>작성자</CustomTableCell>
                                    <CustomTableCell sx={{ width: '10%' }}>좋아요</CustomTableCell>
                                    <CustomTableCell sx={{ width: '10%' }}>조회수</CustomTableCell>
                                    <CustomTableCell sx={{ width: '10%' }}>작성일</CustomTableCell>
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
                                    posts.map((post) => {
                                        // getPostDateInfo 함수를 사용하여 날짜 정보와 수정 여부를 가져옴
                                        const { dateDisplay, isModified } = getPostDateInfo(post.modifiedDate, post.createdDate);
                                        // savedInView 상태에 따른 조회수 색상 결정
                                        const viewColor = post.savedInViews ? VIEW_SAVED_COLOR : LIGHT_TEXT_COLOR;
                                        const viewFontWeight = post.savedInViews ? 700 : 400;

                                        return (
                                            <TableRow
                                                key={post.id}
                                                onClick={() => handleRowClick(post.id)}
                                                sx={(theme) => ({
                                                    textDecoration: 'none',
                                                    '& > .MuiTableCell-root': { borderBottom: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` },
                                                    '&:last-child > .MuiTableCell-root': { borderBottom: 'none' },
                                                    // [수정] savedInViews가 false이면 NEW_COLOR의 투명도를 적용하여 배경색 설정
                                                    backgroundColor: post.savedInViews ? BG_COLOR : alpha(NEW_COLOR, 0.1),
                                                    '&:hover': {
                                                        backgroundColor: alpha(TEXT_COLOR, 0.05),
                                                        cursor: 'pointer'
                                                    },
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'block',
                                                        borderBottom: `1px solid ${TEXT_COLOR} !important`,
                                                        padding: theme.spacing(1, 0),
                                                        '& > .MuiTableCell-root': { borderBottom: 'none !important' },
                                                    }
                                                })}
                                            >
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
                                                    <Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                                                        {post.title}
                                                        {/* 댓글 수 표시 조건부 렌더링 */}
                                                        {post.commentNumber > 0 && (
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    ml: 1,
                                                                    fontWeight: 600,
                                                                    color: RED_COLOR,
                                                                    fontSize: '0.8rem',
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                [{post.commentNumber}]
                                                            </Typography>
                                                        )}
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
                                                {/* 좋아요 수 */}
                                                <TableCell sx={(theme) => ({
                                                    color: post.savedInLikes ? PURPLE_COLOR : RED_COLOR,
                                                    fontWeight: 600,
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'flex',
                                                        justifyContent: 'flex-start',
                                                        alignItems: 'center',
                                                        fontSize: '0.85rem',
                                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                                        order: 5,
                                                        color: LIGHT_TEXT_COLOR,
                                                        fontWeight: 400,
                                                        '&::before': { content: `'${mobileLabels[4]}: '`, ...labelStyles }
                                                    }
                                                })}>
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            display: 'inline',
                                                            mr: 0.5,
                                                            mt: { xs: 0, md: 0.2 }
                                                        }}
                                                    >
                                                        <FavoriteIcon
                                                            sx={{
                                                                fontSize: '1rem',
                                                                verticalAlign: 'middle',
                                                                color: post.savedInLikes ? PURPLE_COLOR : RED_COLOR
                                                            }}
                                                        />
                                                    </Box>
                                                    {post.likes || 0}
                                                </TableCell>
                                                {/* 조회수 */}
                                                <TableCell sx={(theme) => ({
                                                    color: viewColor,
                                                    fontWeight: viewFontWeight,
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'flex',
                                                        justifyContent: 'flex-start',
                                                        alignItems: 'center',
                                                        fontSize: '0.85rem',
                                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                                        order: 6,
                                                        '&::before': { content: `'${mobileLabels[5]}: '`, ...labelStyles }
                                                    }
                                                })}>
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            display: 'inline',
                                                            mr: 0.5,
                                                            mt: { xs: 0, md: 0.2 },
                                                            color: viewColor,
                                                        }}
                                                    >
                                                        <VisibilityIcon sx={{
                                                            fontSize: '1rem',
                                                            verticalAlign: 'middle',
                                                            color: viewColor
                                                        }} />
                                                    </Box>
                                                    {post.viewCount || 0}
                                                </TableCell>
                                                {/* 작성일 */}
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
                                                })}>
                                                    {/* 날짜 표시 (modifiedDate 또는 createdDate 기준) */}
                                                    <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                                                        {dateDisplay}
                                                        {/* [수정됨] 표시 로직 */}
                                                        {isModified && (
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    ml: 0.5,
                                                                    fontWeight: 600,
                                                                    color: MODIFIED_COLOR,
                                                                    fontSize: '0.7rem', // 작은 글씨
                                                                    flexShrink: 0,
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                [수정됨]
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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