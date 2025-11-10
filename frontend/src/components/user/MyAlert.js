// src/components/MyAlert.js

import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    Tabs, Tab, Chip, Pagination,
    CircularProgress,
    TextField, InputAdornment, IconButton, Menu, MenuItem,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import apiClient from '../../api/Api-Service';

// 검색 및 정렬 관련 아이콘 추가
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';


// PostsList.js에서 재사용할 상수 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';
const HEADER_HEIGHT = '64px';
// 알림 페이지에 맞게 상수 재정의/일부 제거
const NEW_COLOR = '#4CAF50'; // 새 알림(읽지 않음) 색상
const READ_COLOR = LIGHT_TEXT_COLOR; // 읽은 알림 색상

// 알림 유형 색상 정의
const COMMENT_COLOR = '#8B4513'; // 댓글
const ACCEPT_COLOR = '#9c27b0'; // 채택
// const APPLY_RECEIVED_COLOR = '#F44336'; // 신청 (접수) -> 백엔드 subject에 없어 삭제
const APPROVE_COLOR = '#4CAF50';        // 신청 (승인)
const REJECT_COLOR = '#FF9800';         // 신청 (거절)


// 스타일 컴포넌트 정의 (MyAlertWrapper, AlertCard, CustomTab, CustomTableCell, CustomSearchField, FilterButton)
const MyAlertWrapper = styled(Box)(({ theme }) => ({
    marginTop: HEADER_HEIGHT,
    backgroundColor: BG_COLOR,
    padding: theme.spacing(4, 0),
}));

/**
 * [수정 1]
 * styled-component의 이름이 소문자 'alertCard'로 정의되어 JSX에서 HTML 태그로 인식되어
 * border 스타일이 적용되지 않았습니다.
 * 컴포넌트 이름은 PascalCase인 'AlertCard'로 수정했습니다.
 */
const AlertCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: (theme.shape?.borderRadius || 4) * 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: `1px solid ${TEXT_COLOR}`, // border 스타일이 컴포넌트 속성으로 정상 적용됨
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

const CustomTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 700,
    color: TEXT_COLOR,
    backgroundColor: alpha(TEXT_COLOR, 0.03),
    borderBottom: `1px solid ${TEXT_COLOR}`,
    fontSize: '1rem',
    [theme.breakpoints.down('sm')]: {
        display: 'none', // 모바일에서 숨김
    },
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
    flexGrow: 1,
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

/**
 * [수정 2]
 * 백엔드에서 subject 문자열("댓글", "채택", "승인", "거절")을 직접 응답하므로, 
 * 숫자(type)를 문자열로 변환하는 getAlertTypeString 함수는 더 이상 필요하지 않습니다. (삭제)
 */
// const getAlertTypeString = ... (삭제됨)


/**
 * 알림 유형에 따른 칩 스타일을 반환합니다.
 * [수정 2] subject 문자열("댓글", "채택", "승인", "거절")을 인자로 받아 색상을 매핑하도록 수정했습니다.
 * @param {string} subject 백엔드에서 응답한 알림 주제 ("댓글", "채택", "승인", "거절")
 * @returns {object} 스타일 객체
 */
const getChipStyle = (subject) => {
    let chipColor;
    switch (subject) {
        case '댓글': chipColor = COMMENT_COLOR; break;
        case '채택': chipColor = ACCEPT_COLOR; break;
        case '승인': chipColor = APPROVE_COLOR; break; // 백엔드 subject에 맞춰 '승인'으로 수정
        case '거절': chipColor = REJECT_COLOR; break; // 백엔드 subject에 맞춰 '거절'로 수정
        default: chipColor = LIGHT_TEXT_COLOR; break;
    }
    return {
        backgroundColor: chipColor,
        color: BG_COLOR,
        fontWeight: 600,
        fontSize: '0.75rem',
        height: '24px',
    };
};

/**
 * 게시글 날짜를 조건부로 포매팅하는 함수
 */
const formatTimeOrDate = (dateString) => {
    const postDate = new Date(dateString);
    const today = new Date();

    const postDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (postDay.getTime() === todayDay.getTime()) {
        const hours = String(postDate.getHours()).padStart(2, '0');
        const minutes = String(postDate.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    else {
        const month = String(postDate.getMonth() + 1).padStart(2, '0');
        const day = String(postDate.getDate()).padStart(2, '0');
        return `${month}/${day}`;
    }
};

// 알림 목록 컴포넌트
const MyAlert = () => {
    // API 연동 및 데이터 관련 상태
    const [alerts, setAlerts] = useState([]); // setalerts -> setAlerts
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalAlerts, setTotalAlerts] = useState(0); // setTotalalerts -> setTotalAlerts

    // 필터링, 검색, 페이지네이션 상태
    const [selectedTab, setSelectedTab] = useState(0);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingSearchTerm, setPendingSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('게시글 제목');

    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const openSortMenu = Boolean(sortAnchorEl);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const openFilterMenu = Boolean(filterAnchorEl);
    const [perPageAnchorEl, setPerPageAnchorEl] = useState(null);
    const openPerPageMenu = Boolean(perPageAnchorEl);
    
    const [sortOrder, setSortOrder] = useState('desc');


    /**
     * 알림 목록 API 호출 로직
     */
    useEffect(() => {
        const fetchAlerts = async (currentPage, currentTab, currentSortOrder, currentRowsPerPage, currentSearchField, currentSearchTerm) => { // fetchalerts -> fetchAlerts
            setIsLoading(true);
            setError(null);

             const pageNumberForBackend = currentPage - 1;
            const sortParam = `id,${currentSortOrder}`;
            const searchFieldParam = `searchField=${currentSearchField}`;
            const searchTermParam = `searchTerm=${currentSearchTerm}`;
            // 탭 필터링 (0은 '전체'이므로 필터링하지 않음)
            const tabParam = currentTab > 0 ? `&tab=${currentTab}` : '';

            // API 엔드포인트는 항상 일반 게시판 경로인 '/alert' 사용
            const baseUrl = '/alert'; 

            // API URL에 currentRowsPerPage (페이지당 항목 수) 반영
            const url = `${baseUrl}?page=${pageNumberForBackend}&size=${currentRowsPerPage}&sort=${sortParam}&${searchFieldParam}&${searchTermParam}${tabParam}`;

            try {
                    const response = await apiClient.get(url) // resposne -> response
                    const alertData = response.data.result // alertData 유지
                    if(alertData) {
                        setAlerts(alertData.content) // setalerts -> setAlerts
                        setTotalAlerts(alertData.totalElements || 0) // setTotalalerts -> setTotalAlerts
                    } else {
                        setAlerts([]) // setalerts -> setAlerts
                        setTotalAlerts(0) // setTotalalerts -> setTotalAlerts
                    }
            } catch (error) {
                const errorMsg = error.response?.data?.message || "데이터 로드 중 오류가 발생했습니다";
                console.error("알림 로드 오류:", errorMsg); // 알림 로드 오류
                setError(errorMsg);
                setAlerts([]); // setalerts -> setAlerts
                setTotalAlerts(0); // setTotalalerts -> setTotalAlerts
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlerts(page, selectedTab, sortOrder, rowsPerPage, searchField, searchTerm); // fetchalerts -> fetchAlerts

    }, [page, selectedTab, sortOrder, rowsPerPage, searchField, searchTerm]);


    // 나머지 이벤트 핸들러 및 렌더링 로직
    const handleTabChange = (event, newValue) => { setSelectedTab(newValue); setPage(1); };
    const handlePageChange = (event, value) => { setPage(value); };
    const handleSortClick = (event) => { setSortAnchorEl(event.currentTarget); };
    const handleSortClose = () => { setSortAnchorEl(null); };
    const handleSortOptionSelect = (order) => { setSortOrder(order); setPage(1); setSortAnchorEl(null); };
    const handleFilterClick = (event) => { setFilterAnchorEl(event.currentTarget); };
    const handleFilterClose = () => { setFilterAnchorEl(null); };
    const handleFilterOptionSelect = (field) => { setSearchField(field); setPage(1); setFilterAnchorEl(null); };
    const handleSearchSubmit = () => { setSearchTerm(pendingSearchTerm); setPage(1); };
    const handlePerPageClick = (event) => { setPerPageAnchorEl(event.currentTarget); };
    const handlePerPageClose = () => { setPerPageAnchorEl(null); };
    const handlePerPageSelect = (value) => { setRowsPerPage(value); setPage(1); setPerPageAnchorEl(null); };
    const handleRowClick = async (alert) => {
        // ... (API 호출 및 페이지 이동 로직)
        const targetPath = alert.link || `/post/${alert.postsId}?from=my-alerts`;
        window.location.href = targetPath;
    };
    const pageCount = Math.ceil(totalAlerts / rowsPerPage); // totalalerts -> totalAlerts
    const tabLabels = ['전체', '댓글', '채택', '신청'];
    const mobileLabels = ['ID', '유형', '게시글 제목', '알림 내용', '작성자', '작성일'];
    const labelStyles = { fontWeight: 'bold', color: TEXT_COLOR, minWidth: '60px', marginRight: '8px' };


    return (
        <MyAlertWrapper>
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    align="left"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 4, color: TEXT_COLOR, fontSize: { xs: '2rem', md: '2.5rem' }, textAlign: {xs: 'center', md: 'left'} }}
                >
                    알림
                </Typography>
                {/* [수정 1] AlertCard로 컴포넌트 이름 수정 */}
                <AlertCard elevation={0}>
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
                        {/* 탭 네비게이션: [전체, 댓글, 채택, 신청] */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: { xs: 'flex-start', md: 'flex-start' },
                            overflowX: { xs: 'hidden', md: 'visible' },
                        }}>
                            <Tabs
                                value={selectedTab}
                                onChange={handleTabChange}
                                aria-label="알림 유형 탭"
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
                                {tabLabels.map((label, index) => (
                                    <CustomTab key={index} label={label} value={index} />
                                ))}
                            </Tabs>
                        </Box>
                        
                        {/* 정렬, 검색, 페이지당 항목 수 영역 */}
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
                                <Box sx={{
                                    display: 'flex',
                                    gap: 1,
                                    width: { xs: '100%', md: 'auto' },
                                    justifyContent: 'flex-start',
                                }}>
                                    {/* 정렬 버튼/메뉴 */}
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
                                    <Menu
                                        anchorEl={sortAnchorEl}
                                        open={openSortMenu}
                                        onClose={handleSortClose}
                                        id="sort-menu"
                                        slotProps={{ paper: { sx: { border: `1px solid ${TEXT_COLOR}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', }, }, }}
                                    >
                                        <MenuItem onClick={() => handleSortOptionSelect('desc')}>내림차순</MenuItem>
                                        <MenuItem onClick={() => handleSortOptionSelect('asc')}>오름차순</MenuItem>
                                    </Menu>

                                    {/* 검색 필드 선택 버튼/메뉴 */}
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
                                    <Menu
                                        anchorEl={filterAnchorEl}
                                        open={openFilterMenu}
                                        onClose={handleFilterClose}
                                        id="filter-menu"
                                        slotProps={{ paper: { sx: { border: `1px solid ${TEXT_COLOR}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', }, }, }}
                                    >
                                        <MenuItem onClick={() => handleFilterOptionSelect('제목')}>게시글 제목</MenuItem>
                                        <MenuItem onClick={() => handleFilterOptionSelect('내용')}>알림 내용</MenuItem>
                                        <MenuItem onClick={() => handleFilterOptionSelect('작성자')}>작성자</MenuItem>
                                    </Menu>
                                </Box>

                                {/* 검색 입력 필드 */}
                                <CustomSearchField
                                    label={`검색 (${searchField})`}
                                    variant="outlined"
                                    size="small"
                                    value={pendingSearchTerm}
                                    onChange={(e) => { setPendingSearchTerm(e.target.value); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { handleSearchSubmit(); } }}
                                    sx={{ minWidth: { xs: '100%', md: '200px' }, flexGrow: 1, mt: { xs: 1, md: 0 }, color: { xs: LIGHT_TEXT_COLOR } }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton sx={{ color: TEXT_COLOR }} edge="end" onClick={handleSearchSubmit}>
                                                    <SearchIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                
                                {/* 몇 개씩 보여줄지 선택 메뉴 */}
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
                                <Menu
                                    anchorEl={perPageAnchorEl}
                                    open={openPerPageMenu}
                                    onClose={handlePerPageClose}
                                    id="per-page-menu"
                                    slotProps={{ paper: { sx: { border: `1px solid ${TEXT_COLOR}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', }, }, }}
                                >
                                    {[10, 15, 30, 50].map((count) => (
                                        <MenuItem key={count} onClick={() => handlePerPageSelect(count)} selected={count === rowsPerPage}>
                                            {count}개씩 보기
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                        </Box>
                    </Box>

                    {/* 알림 테이블 */}
                    <TableContainer component={Paper} elevation={0}
                        sx={(theme) => ({
                            border: `1px solid ${TEXT_COLOR}`,
                            [theme.breakpoints.down('sm')]: {
                                marginX: theme.spacing(2),
                                width: `calc(100% - ${theme.spacing(4)})`,
                            },
                        })}
                    >
                        <Table aria-label="알림 목록">
                            <TableHead>
                                <TableRow>
                                    <CustomTableCell sx={{ width: '5%' }}>ID</CustomTableCell>
                                    <CustomTableCell sx={{ width: '8%' }}>유형</CustomTableCell>
                                    <CustomTableCell sx={{ width: '30%' }}>게시글 제목</CustomTableCell>
                                    <CustomTableCell sx={{ width: '30%' }}>알림 내용</CustomTableCell>
                                    <CustomTableCell sx={{ width: '12%' }}>작성자</CustomTableCell>
                                    <CustomTableCell sx={{ width: '15%' }}>작성일</CustomTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* 로딩 및 에러 상태 */}
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5 }}>
                                            <CircularProgress sx={{ color: TEXT_COLOR }} size={30} />
                                            <Typography variant="body1" sx={{ mt: 1, color: LIGHT_TEXT_COLOR }}>알림을 불러오는 중...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5 }}>
                                            <Typography variant="body1" color="error">{error}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : alerts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5 }}>
                                            <Typography variant="body1" sx={{ color: LIGHT_TEXT_COLOR }}>
                                                {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '알림이 없습니다.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // 알림 목록 렌더링
                                    alerts.map((alert) => {
                                        const isRead = alert.isRead;
                                        // [수정 2] 백엔드 subject 필드를 사용
                                        const subjectString = alert.subject; 
                                        const rowColor = isRead ? READ_COLOR : TEXT_COLOR;
                                        const rowFontWeight = isRead ? 400 : 700;

                                        // [수정 2] 화면 표시용 문자열 생성 (신청에 해당하는 경우 '신청(승인)'/'신청(거절)'로 표시)
                                        const typeDisplayString = (subjectString === '승인' || subjectString === '거절') 
                                            ? `신청(${subjectString})` 
                                            : subjectString;

                                        return (
                                            <TableRow
                                                key={alert.id}
                                                onClick={() => handleRowClick(alert)}
                                                sx={(theme) => ({
                                                    textDecoration: 'none',
                                                    '& > .MuiTableCell-root': { borderBottom: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` },
                                                    '&:last-child > .MuiTableCell-root': { borderBottom: 'none' },
                                                    backgroundColor: isRead ? BG_COLOR : alpha(NEW_COLOR, 0.1),
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
                                                {/* 1. ID */}
                                                <TableCell component="th" scope="row"
                                                    sx={(theme) => ({
                                                        color: rowColor,
                                                        fontWeight: rowFontWeight,
                                                        [theme.breakpoints.down('sm')]: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            fontSize: '0.8rem',
                                                            padding: theme.spacing(0, 2, 0.5, 2),
                                                            order: 6,
                                                            color: LIGHT_TEXT_COLOR,
                                                            '&::before': { content: `'${mobileLabels[0]}: '`, ...labelStyles }
                                                        }
                                                    })}
                                                >{alert.id}</TableCell>
                                                
                                                {/* 2. 유형 (댓글, 채택, 신청(승인), 신청(거절)) */}
                                                <TableCell
                                                    sx={(theme) => ({
                                                        color: rowColor,
                                                        fontWeight: rowFontWeight,
                                                        [theme.breakpoints.down('sm')]: {
                                                            display: 'flex',
                                                            justifyContent: 'flex-start',
                                                            padding: theme.spacing(0.5, 2, 0, 2),
                                                            order: 1,
                                                        }
                                                    })}
                                                >
                                                    {/* [수정 2] subjectString(컬러 매핑)과 typeDisplayString(화면 표시) 사용 */}
                                                    <Chip label={typeDisplayString} size="small" style={getChipStyle(subjectString)} /> 
                                                    {/* 모바일에서 상태 표시 */}
                                                    <Box component="span" sx={{
                                                        ml: 1,
                                                        color: isRead ? READ_COLOR : NEW_COLOR,
                                                        fontWeight: 600,
                                                        display: { xs: 'inline', sm: 'none' }
                                                    }}>
                                                        ({isRead ? '읽음' : '새 알림'})
                                                    </Box>
                                                </TableCell>

                                                {/* 3. 게시글 제목 */}
                                                <TableCell sx={(theme) => ({
                                                    fontWeight: 600, color: rowColor,
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        fontSize: '1rem',
                                                        padding: theme.spacing(1, 2, 0.5, 2),
                                                        order: 2,
                                                        whiteSpace: 'normal',
                                                        wordBreak: 'break-word',
                                                        '&::before': { content: `'${mobileLabels[2]}: '`, ...labelStyles }
                                                    }
                                                })}>
                                                    <Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                                                        {alert.postsTitle || '제목 없음'}
                                                    </Box>
                                                </TableCell>

                                                {/* 4. 알림 내용 */}
                                                <TableCell sx={(theme) => ({
                                                    fontWeight: rowFontWeight, color: rowColor, fontSize: '0.85rem',
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        fontSize: '0.9rem',
                                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                                        order: 3,
                                                        whiteSpace: 'normal',
                                                        wordBreak: 'break-word',
                                                        '&::before': { content: `'${mobileLabels[3]}: '`, ...labelStyles }
                                                    }
                                                })}>
                                                    <Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                                                        {alert.content || '알림 내용이 없습니다.'}
                                                    </Box>
                                                </TableCell>
                                                
                                                {/* 5. 작성자 */}
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
                                                })}>{alert.username || '알 수 없음'}
                                                </TableCell>
                                                
                                                {/* 6. 작성일 */}
                                                <TableCell sx={(theme) => ({
                                                    color: LIGHT_TEXT_COLOR,
                                                    [theme.breakpoints.down('sm')]: {
                                                        display: 'flex',
                                                        justifyContent: 'flex-start',
                                                        fontSize: '0.85rem',
                                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                                        order: 5,
                                                        '&::before': { content: `'${mobileLabels[5]}: '`, ...labelStyles }
                                                    }
                                                })}>
                                                    {formatTimeOrDate(alert.createdDate)}
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
                </AlertCard>
            </Container>
        </MyAlertWrapper>
    );
};

export default MyAlert;