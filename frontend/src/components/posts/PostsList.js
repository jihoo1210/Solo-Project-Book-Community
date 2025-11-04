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
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import apiClient from '../../api/Api-Service';

// 상수 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';
const HEADER_HEIGHT = '64px';

// 스타일 컴포넌트 정의
const PostsListWrapper = styled(Box)(({ theme }) => ({
    marginTop: HEADER_HEIGHT,
    minHeight: `calc(100vh - ${HEADER_HEIGHT} - 150px)`,
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


const PostsList = () => {
    // API 연동 및 데이터 관련 상태
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPosts, setTotalPosts] = useState(0); // 페이지네이션에 사용될 전체 게시글 수

    // 필터링, 정렬, 페이지네이션 상태
    const [selectedTab, setSelectedTab] = useState(0); // 0: 전체, 1: 질문, 2: 공유, 3: 모집
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // 정렬 순서 ('desc' 또는 'asc')
    const [searchField, setSearchField] = useState('제목'); // 검색 필드 ('제목', '작성자', '내용')

    // 메뉴 Anchor 상태
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const openSortMenu = Boolean(sortAnchorEl);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const openFilterMenu = Boolean(filterAnchorEl);

    const rowsPerPage = 10;

    // 게시글 목록 API 호출 로직
    useEffect(() => {
        const fetchPosts = async (currentPage, currentTab, currentSortOrder, currentSearchField, currentSearchTerm) => {
            setIsLoading(true);
            setError(null);

            const pageNumberForBackend = currentPage - 1; // 백엔드는 보통 0부터 시작
            const sortParam = `id,${currentSortOrder}`;
            const searchFieldParam = `searchField=${currentSearchField}`;
            const searchTermParam = `searchTerm=${currentSearchTerm}`;
            // 탭 필터링 (0은 '전체'이므로 필터링하지 않음)
            const tabParam = currentTab > 0 ? `&tab=${currentTab}` : '';

            const url = `/posts?page=${pageNumberForBackend}&size=${rowsPerPage}&sort=${sortParam}&${searchFieldParam}&${searchTermParam}${tabParam}`;

            try {
                const response = await apiClient.get(url);
                const result = response.data.result;

                if (result) {
                    let newPosts = [];
                    let newTotalPosts = 0;

                    if (result.content && Array.isArray(result.content)) {
                        // Spring Page 객체 구조인 경우 처리
                        newPosts = result.content;
                        newTotalPosts = result.totalElements || 0;
                    } else if (Array.isArray(result)) {
                        // 결과가 게시글 배열을 직접 포함하는 경우 (Page 객체가 아닌 경우)
                        newPosts = result;
                        // totalPosts 정보가 없어 페이지네이션이 불완전할 수 있음 (서버 수정 권장)
                        // 임시로 posts.length를 사용하거나, 서버에서 totalElements를 받도록 수정 필요
                    }

                    setPosts(newPosts);
                    setTotalPosts(newTotalPosts);
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

        // 종속성 배열의 상태가 변경될 때마다 API 호출
        fetchPosts(page, selectedTab, sortOrder, searchField, searchTerm);

    }, [page, selectedTab, sortOrder, searchField, searchTerm]);

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

    // 전체 게시글 수와 페이지당 행 수를 기반으로 페이지 수 계산
    const pageCount = Math.ceil(totalPosts / rowsPerPage);

    // 모바일 뷰에서 사용할 레이블 및 스타일
    const mobileLabels = ['ID', '주제', '제목', '작성자', '작성일'];
    const labelStyles = { fontWeight: 'bold', color: TEXT_COLOR, minWidth: '60px', marginRight: '8px' };

    return (
        <PostsListWrapper>
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    align="left"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 4, color: TEXT_COLOR, fontSize: { xs: '2rem', md: '2.5rem' } }}
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
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1); // 검색어 변경 시 1페이지로 초기화
                                    }}
                                    sx={{ minWidth: { xs: '100%', md: '200px' }, flexGrow: 1, mt: { xs: 1, md: 0 } }}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton sx={{ color: TEXT_COLOR }} edge="end">
                                                        <SearchIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }
                                    }
                                    }
                                />
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
                                    <CustomTableCell>ID</CustomTableCell>
                                    <CustomTableCell>주제</CustomTableCell>
                                    <CustomTableCell>제목</CustomTableCell>
                                    <CustomTableCell>작성자</CustomTableCell>
                                    <CustomTableCell>작성일</CustomTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* 로딩 상태 */}
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5 }}>
                                            <CircularProgress sx={{ color: TEXT_COLOR }} size={30} />
                                            <Typography variant="body1" sx={{ mt: 1, color: LIGHT_TEXT_COLOR }}>게시글을 불러오는 중...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    /* 에러 상태 */
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5 }}>
                                            <Typography variant="body1" color="error">{error}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : posts.length === 0 ? (
                                    /* 게시글 없음 상태 */
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5 }}>
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
                                            component={Link}
                                            to={`/post/${post.id}`}
                                            sx={(theme) => ({
                                                textDecoration: 'none',
                                                '& > .MuiTableCell-root': { borderBottom: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` },
                                                '&:last-child > .MuiTableCell-root': { borderBottom: 'none' },
                                                '&:hover': {
                                                    backgroundColor: alpha(TEXT_COLOR, 0.05),
                                                    cursor: 'pointer'
                                                },
                                                [theme.breakpoints.down('sm')]: {
                                                    display: 'block',
                                                    borderBottom: `1px solid ${TEXT_COLOR} !important`,
                                                    padding: theme.spacing(1, 0),
                                                    '&:last-child': { borderBottom: `1px solid ${TEXT_COLOR} !important` },
                                                    '& > .MuiTableCell-root': { borderBottom: 'none !important' },
                                                }
                                            })}
                                        >
                                            {/* ID (모바일에서는 레이블과 함께 표시) */}
                                            <TableCell component="th" scope="row"
                                                sx={(theme) => ({
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        fontSize: '0.8rem',
                                                        color: LIGHT_TEXT_COLOR,
                                                        padding: theme.spacing(0, 2, 0.5, 2),
                                                        order: 5,
                                                        '&::before': { content: `'${mobileLabels[0]}: '`, ...labelStyles }
                                                    }
                                                })}
                                            >{post.id}</TableCell>

                                            {/* 주제 (Chip으로 표시) */}
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

                                            {/* 제목 및 댓글 수 */}
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
                                                <Box component="span" sx={{ color: '#F44336', fontWeight: 600, ml: 1.5, flexShrink: 0 }}>
                                                    [{post.comments}]
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
                                            })}>{post.writer}</TableCell>

                                            {/* 작성일 */}
                                            <TableCell sx={(theme) => ({
                                                color: LIGHT_TEXT_COLOR,
                                                [theme.breakpoints.down('sm')]: {
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    fontSize: '0.85rem',
                                                    padding: theme.spacing(0.5, 2, 0.5, 2),
                                                    order: 4,
                                                    '&::before': { content: `'${mobileLabels[4]}: '`, ...labelStyles }
                                                }
                                            })}>{post.createdDate}</TableCell>
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