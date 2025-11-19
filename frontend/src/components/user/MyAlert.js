import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    Tabs, Tab, Chip, Pagination,
    CircularProgress,
    TextField, InputAdornment, IconButton, Menu, MenuItem,
    Collapse,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import apiClient from '../../api/Api-Service';

import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


import {
    BG_COLOR, TEXT_COLOR, LIGHT_TEXT_COLOR, HEADER_HEIGHT,
    COMMENT_COLOR, ADOPT_COLOR,
    APPROVE_COLOR, REJECT_COLOR,
    APPLICATION_COLOR,
    NEW_COLOR
} from '../constants/Theme';
import { formatTimeOrDate } from '../utilities/DateUtiles';


// --- 스타일 컴포넌트 정의 ---

const MyAlertWrapper = styled(Box)(({ theme }) => ({
    marginTop: HEADER_HEIGHT,
    backgroundColor: BG_COLOR,
    padding: theme.spacing(4, 0),
}));

const AlertCard = styled(Paper)(({ theme }) => ({
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
        minWidth: '20%',
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
        display: 'none',
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
 * 알림 유형에 따른 칩 스타일을 반환합니다.
 */
const getChipStyle = (subject) => {
    let chipColor;
    switch (subject) {
        case '댓글': chipColor = COMMENT_COLOR; break;
        case '채택': chipColor = ADOPT_COLOR; break;
        case '신청': chipColor = APPLICATION_COLOR; break;
        case '승인': chipColor = APPROVE_COLOR; break;
        case '거절': chipColor = REJECT_COLOR; break;
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

// 모바일 뷰 테이블 셀에 사용될 레이블 정의
const mobileLabelStyles = { fontWeight: 'bold', color: TEXT_COLOR, minWidth: '60px', marginRight: '8px' };
const mobileLabels = ['ID', '유형', '게시글 제목', '알림 내용', '작성자', '작성일'];


// 알림 목록 컴포넌트
const MyAlert = () => {
    // API 연동 및 데이터 관련 상태
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalAlerts, setTotalAlerts] = useState(0);

    // 필터링, 검색, 페이지네이션 상태
    const [selectedTab, setSelectedTab] = useState(0);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [searchTerm, setSearchTerm] = useState('');
    const [pendingSearchTerm, setSearchTermPending] = useState('');
    const [searchField, setSearchField] = useState('제목');

    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const openSortMenu = Boolean(sortAnchorEl);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const openFilterMenu = Boolean(filterAnchorEl);
    const [perPageAnchorEl, setPerPageAnchorEl] = useState(null);
    const openPerPageMenu = Boolean(perPageAnchorEl);

    const [sortOrder, setSortOrder] = useState('desc');

    const [expandedAlertId, setExpandedAlertId] = useState(null); // 현재 확장된 알림의 ID
    const [reason, setReason] = useState('');
    const [actionLoading, setActionLoading] = useState(null);


    /**
     * 알림 목록 API 호출 로직
     */
    const fetchAlerts = async (currentPage, currentTab, currentSortOrder, currentRowsPerPage, currentSearchField, currentSearchTerm) => {
        setIsLoading(true);
        setError(null);

        const pageNumberForBackend = currentPage - 1;
        const sortParam = `id,${currentSortOrder}`;
        const searchFieldParam = `searchField=${currentSearchField}`;
        const searchTermParam = `searchTerm=${currentSearchTerm}`;
        const tabParam = currentTab > 0 ? `&tab=${currentTab}` : '';

        const baseUrl = '/alert';

        const url = `${baseUrl}?page=${pageNumberForBackend}&size=${currentRowsPerPage}&sort=${sortParam}&${searchFieldParam}&${searchTermParam}${tabParam}`;

        try {
            const response = await apiClient.get(url)
            const alertData = response.data.result
            if (alertData) {
                setAlerts(alertData.content)
                setTotalAlerts(alertData.totalElements || 0)
            } else {
                setAlerts([])
                setTotalAlerts(0)
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "데이터 로드 중 오류가 발생했습니다";
            console.error("알림 로드 오류:", errorMsg);
            setError(errorMsg);
            setAlerts([]);
            setTotalAlerts(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts(page, selectedTab, sortOrder, rowsPerPage, searchField, searchTerm);
    }, [page, selectedTab, sortOrder, rowsPerPage, searchField, searchTerm]);

    /**
     * 승인 처리 핸들러 (인라인 액션 처리)
     */
    const handleApprove = async (alert) => {
        if (actionLoading) return;
        if (!window.confirm(`게시글 ID ${alert.postsId}에 대한 신청을 승인하시겠습니까?`)) {
            return;
        }
        setActionLoading(alert.id);

        try {
            // POST 요청
            await apiClient.post(`/recruit/${alert.id}/accept`, { content: reason.trim() });
            // 승인 후 로컬 상태 업데이트: subject를 '승인'으로 변경
            setAlerts(prevAlerts => prevAlerts.map(a => a.id === alert.id ? { ...a, subject: '승인', content: '신청이 승인되었습니다.' } : a)); 
            window.alert("신청이 승인되었습니다.");
            fetchAlerts(page, selectedTab, sortOrder, rowsPerPage, searchField, searchTerm);
        } catch (error) {
            console.log(error)
            const errorMsg = error.response?.data?.message || "승인 처리 중 오류가 발생했습니다.";
            window.alert(errorMsg);
        } finally {
            setActionLoading(null);
            setExpandedAlertId(null); // 확장 상태 닫기
            setReason('');
        }
    };

    /**
     * 거절 제출 핸들러 (인라인 액션 처리)
     */
    const handleReject = async (alert) => {
        if (actionLoading) return;
        if (!reason.trim()) {
            window.alert("거절 사유를 입력해 주세요.");
            return;
        }

        if (!window.confirm(`게시글 ID ${alert.postsId}에 대한 신청을 거절하시겠습니까?`)) {
            return;
        }

        setActionLoading(alert.id);

        try {
            // POST 요청
            await apiClient.post(`/recruit/${alert.id}/reject`, {
                content: reason.trim()
            });
            const newContent = `신청이 거절되었습니다. 사유: ${reason.trim()}`;
            // 거절 후 로컬 상태 업데이트: subject를 '거절'으로 변경
            setAlerts(prevAlerts => prevAlerts.map(a => a.id === alert.id ? { ...a, subject: '거절', content: newContent } : a));
            window.alert("신청이 거절되었습니다.");
            fetchAlerts(page, selectedTab, sortOrder, rowsPerPage, searchField, searchTerm);
        } catch (error) {
            const errorMsg = error.response?.data?.message || "거절 처리 중 오류가 발생했습니다.";
            window.alert(errorMsg);
        } finally {
            setActionLoading(null);
            setExpandedAlertId(null); // 확장 상태 닫기
            setReason('');
        }
    };


    // 나머지 이벤트 핸들러
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

    /**
     * Row 클릭 핸들러
     * - '신청' 타입일 경우에만 인라인 액션이 표시되며, 다른 알림은 전체 내용만 표시됩니다.
     */
    const handleRowClick = async (alert, event) => {
        // 버튼, 입력 필드 등 클릭 시 네비게이션/확장 방지
        if (event.target.closest('button') || event.target.closest('input') || event.target.closest('textarea')) {
            return;
        }

        // 확장/축소 토글 로직
        if (expandedAlertId === alert.id) {
            setExpandedAlertId(null);
            setReason(''); // 확장 닫을 때 사유 초기화
        } else {
            setExpandedAlertId(alert.id);
            setReason(''); // 확장 열 때 사유 초기화
        }
    };

    const pageCount = Math.ceil(totalAlerts / rowsPerPage);
    const tabLabels = ['전체', '댓글', '채택', '신청', '승인/거절'];


    return (
        <MyAlertWrapper>
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    align="left"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 4, color: TEXT_COLOR, fontSize: { xs: '2rem', md: '2.5rem' }, textAlign: { xs: 'center', md: 'left' } }}
                >
                    알림
                </Typography>
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
                        {/* 탭 네비게이션 */}
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
                                    onChange={(e) => { setSearchTermPending(e.target.value); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { handleSearchSubmit(); } }}
                                    sx={{
                                        minWidth: { xs: '100%', md: '200px' }, flexGrow: 1, mt: { xs: 1, md: 0 }, '& label.Mui-focused': {
                                            color: LIGHT_TEXT_COLOR,
                                        },
                                    }}
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
                                    {/* PC 뷰 컬럼 사이즈 정의 */}
                                    <CustomTableCell sx={{ width: '5%' }}>ID</CustomTableCell>
                                    <CustomTableCell sx={{ width: '8%' }}>유형</CustomTableCell>
                                    <CustomTableCell sx={{ width: '35%' }}>게시글 제목</CustomTableCell>
                                    <CustomTableCell sx={{ width: '30%' }}>알림 내용</CustomTableCell>
                                    <CustomTableCell sx={{ width: '10%' }}>작성자</CustomTableCell>
                                    <CustomTableCell sx={{ width: '12%' }}>작성일</CustomTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* 로딩 및 에러 상태 */}
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5 }}>
                                            <CircularProgress sx={{ color: TEXT_COLOR }} size={30} />
                                            <Typography variant="body1" sx={{ mt: 1, color: LIGHT_TEXT_COLOR }}>알림을 불러오는 중...</Typography>
                                        </TableCell></TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5 }}>
                                            <Typography variant="body1" color="error">{error}</Typography>
                                        </TableCell></TableRow>
                                ) : alerts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5 }}>
                                            <Typography variant="body1" sx={{ color: LIGHT_TEXT_COLOR }}>
                                                {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '알림이 없습니다.'}
                                            </Typography>
                                        </TableCell></TableRow>
                                ) : (
                                    // 알림 목록 렌더링
                                    alerts.map((alert) => {
                                        const subjectString = alert.subject;
                                        
                                        const isViewed = alert.savedInViews;
                                        const isExpanded = expandedAlertId === alert.id; // 확장 상태 확인
                                        
                                        const rowBackgroundColor = isViewed ? BG_COLOR : alpha(NEW_COLOR, 0.1);
                                        const activeBackgroundColor = isExpanded ? alpha(TEXT_COLOR, 0.05) : rowBackgroundColor;

                                        const rowColor = TEXT_COLOR;
                                        const rowFontWeight = 400;

                                        const typeDisplayString = (subjectString === '승인' || subjectString === '거절')
                                            ? `신청(${subjectString})`
                                            : subjectString;

                                        const isApplication = subjectString === '신청';
                                        const isActionProcessing = actionLoading === alert.id;

                                        // 모바일 뷰에서 순서를 지정하기 위한 인덱스
                                        const [
                                            idxId, idxType, idxTitle, idxAuthor, idxDate
                                        ] = [6, 1, 2, 3, 4, 5];


                                        return (
                                            <React.Fragment key={alert.id}>
                                                <TableRow
                                                    onClick={(event) => handleRowClick(alert, event)}
                                                    sx={(theme) => ({
                                                        textDecoration: 'none',
                                                        '& > .MuiTableCell-root': { borderBottom: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` },
                                                        '&:last-child > .MuiTableCell-root': { borderBottom: isExpanded ? `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` : 'none' },
                                                        backgroundColor: activeBackgroundColor,
                                                        '&:hover': {
                                                            backgroundColor: alpha(TEXT_COLOR, 0.05),
                                                            cursor: 'pointer'
                                                        },
                                                        [theme.breakpoints.down('sm')]: {
                                                            display: 'block',
                                                            borderBottom: isExpanded ? 'none !important' : `1px solid ${TEXT_COLOR} !important`, 
                                                            padding: theme.spacing(1, 0),
                                                            '& > .MuiTableCell-root': {
                                                                borderBottom: 'none !important',
                                                                padding: theme.spacing(0.5, 2),
                                                            }
                                                        }
                                                    })}
                                                >
                                                    {/* 1. ID */}
                                                    <TableCell component="th" scope="row"
                                                        sx={(theme) => ({
                                                            color: rowColor, fontWeight: rowFontWeight,
                                                            [theme.breakpoints.down('sm')]: {
                                                                display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: LIGHT_TEXT_COLOR,
                                                                order: idxId,
                                                                '&::before': { content: `'${mobileLabels[0]}: '`, ...mobileLabelStyles }
                                                            }
                                                        })}
                                                    >{alert.id}</TableCell>

                                                    {/* 2. 유형 */}
                                                    <TableCell
                                                        sx={(theme) => ({
                                                            color: rowColor, fontWeight: rowFontWeight,
                                                            [theme.breakpoints.down('sm')]: {
                                                                display: 'flex', justifyContent: 'flex-start',
                                                                order: idxType,
                                                            }
                                                        })}
                                                    >
                                                        <Chip label={typeDisplayString} size="small" style={getChipStyle(subjectString)} />
                                                    </TableCell>

                                                    {/* 3. 게시글 제목 */}
                                                    <TableCell
                                                        sx={(theme) => ({
                                                            fontWeight: 600, color: rowColor,
                                                            maxWidth: {xs: '100%', sm: '300px' },
                                                            [theme.breakpoints.down('sm')]: {
                                                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                                                fontSize: '1rem', order: idxTitle,
                                                                whiteSpace: 'normal', wordBreak: 'break-word',
                                                                padding: theme.spacing(1, 2, 0.5, 2),
                                                                '&::before': { content: `'${mobileLabels[2]}: '`, ...mobileLabelStyles }
                                                            }
                                                        })}
                                                    >
                                                        <Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                                                            {alert.postsTitle || '제목 없음'}
                                                        </Box>
                                                    </TableCell>

                                                    {/* 4. 알림 내용 */}
                                                    <TableCell
                                                        sx={(theme) => ({
                                                            fontWeight: rowFontWeight, color: rowColor, fontSize: '0.85rem',
                                                            [theme.breakpoints.down('sm')]: {
                                                                display: 'flex', 
                                                                justifyContent: 'flex-start',
                                                                '&::before': { content: `'${mobileLabels[3]}: '`, ...mobileLabelStyles }
                                                            }
                                                        })}
                                                    >
                                                        <Box 
                                                            component="span" 
                                                            sx={{ 
                                                                flexGrow: 1, 
                                                                minWidth: 0, 
                                                                display: 'block',
                                                                maxWidth: {xs: '100%', sm: '300px'},
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            {alert.content || '알림 내용이 없습니다.'}
                                                        </Box>
                                                    </TableCell>

                                                    {/* 5. 작성자 */}
                                                    <TableCell
                                                        sx={(theme) => ({
                                                            color: LIGHT_TEXT_COLOR,
                                                            [theme.breakpoints.down('sm')]: {
                                                                display: 'flex', justifyContent: 'flex-start',
                                                                fontSize: '0.85rem', order: idxAuthor,
                                                                '&::before': { content: `'${mobileLabels[4]}: '`, ...mobileLabelStyles }
                                                            }
                                                        })}
                                                    >{alert.username || '알 수 없음'}</TableCell>

                                                    {/* 6. 작성일 */}
                                                    <TableCell
                                                        sx={(theme) => ({
                                                            color: LIGHT_TEXT_COLOR,
                                                            [theme.breakpoints.down('sm')]: {
                                                                display: 'flex', justifyContent: 'space-between',
                                                                fontSize: '0.85rem', order: idxDate,
                                                                padding: theme.spacing(0, 2, 0, 2), 
                                                                '&::before': { content: `'${mobileLabels[5]}: '`, ...mobileLabelStyles }
                                                            }
                                                        })}
                                                    >
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                whiteSpace: 'nowrap',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                width: '100%'
                                                            }}
                                                        >
                                                            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                                                {formatTimeOrDate(alert.createdDate)}
                                                            </Box>
                                                            {/* 아코디언 상태 표시 아이콘 */}
                                                            {isExpanded ?
                                                                <ExpandLessIcon sx={{ color: TEXT_COLOR, ml: 1, flexShrink: 0 }} /> :
                                                                <ExpandMoreIcon sx={{ color: TEXT_COLOR, ml: 1, flexShrink: 0 }} />
                                                            }
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>


                                                {/* 확장된 내용 UI Row (Collapse 적용 및 반응형 적용) */}
                                                <TableRow
                                                    sx={(theme) => ({
                                                        '& > .MuiTableCell-root': { padding: 0, borderBottom: 'none !important' },
                                                        backgroundColor: BG_COLOR,
                                                        [theme.breakpoints.down('sm')]: {
                                                            borderBottom: isExpanded ? `1px solid ${TEXT_COLOR} !important` : 'none !important',
                                                        },
                                                    })}
                                                >
                                                    <TableCell colSpan={6} sx={{ display: { xs: 'block', md: 'table-cell' } }}>
                                                        <Collapse in={isExpanded} timeout={300} unmountOnExit>
                                                            <Box
                                                                sx={(theme) => ({
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 2,
                                                                    p: 4,
                                                                    justifyContent: 'space-between',
                                                                    flexDirection: 'column',
                                                                    borderTop: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.2)}`,
                                                                    borderBottom: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.2)}`,
                                                                    [theme.breakpoints.down('sm')]: {
                                                                        padding: theme.spacing(2),
                                                                        borderBottom: `1px solid ${TEXT_COLOR} !important`,
                                                                    },
                                                                })}
                                                            >
                                                                
                                                                {/* 알림 내용 전체 표시 */}
                                                                <Box sx={{
                                                                    width: '100%',
                                                                    minHeight: '100px',
                                                                    p: 0,
                                                                    mb: isApplication ? 1 : 0,
                                                                    backgroundColor: alpha(BG_COLOR, 0.1), 
                                                                    border: `1px solid ${LIGHT_TEXT_COLOR}`,
                                                                    borderRadius: 1,
                                                                    whiteSpace: 'pre-wrap',
                                                                    wordBreak: 'break-word',
                                                                    color: TEXT_COLOR,
                                                                    fontWeight: 500,
                                                                    textAlign: 'left',
                                                                }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, m: 0.5, color: TEXT_COLOR, margin: '1rem' }}>
                                                                        (전체 내용)
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ color: TEXT_COLOR, fontSize: '0.9rem', margin: '1rem', }}>
                                                                        {'\t' + alert.content || '알림 내용이 없습니다.'}
                                                                    </Typography>
                                                                </Box>
                                                                
                                                                {/* 신청 알림에 대해서만 승인/거절 액션 UI 표시 */}
                                                                {isApplication && ( 
                                                                    <Box sx={{ 
                                                                        width: '100%', 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        gap: 2, 
                                                                        flexDirection: { xs: 'column', md: 'row' },
                                                                        flexWrap: 'wrap',
                                                                        justifyContent: 'space-between',
                                                                        mt: 2,
                                                                    }}>
                                                                        <TextField
                                                                            label={"사유 입력 (거절 시 필수)"}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            fullWidth
                                                                            multiline
                                                                            minRows={3}
                                                                            maxRows={30}
                                                                            value={reason}
                                                                            onChange={(e) => setReason(e.target.value)}
                                                                            sx={{
                                                                                '& label.Mui-focused': {
                                                                                    color: LIGHT_TEXT_COLOR,
                                                                                },
                                                                                maxWidth: '100%', 
                                                                                flexGrow: 1,
                                                                                flexShrink: 0,
                                                                                '& .MuiOutlinedInput-root': {
                                                                                    '& fieldset': { borderColor: TEXT_COLOR },
                                                                                    '&:hover fieldset': { borderColor: TEXT_COLOR },
                                                                                    '&.Mui-focused fieldset': { borderColor: TEXT_COLOR },
                                                                                }
                                                                            }}
                                                                            disabled={isActionProcessing}
                                                                        />

                                                                        {/* 승인/거절 버튼 그룹 */}
                                                                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'end' } }}>
                                                                            {/* 승인 버튼 */}
                                                                            <Button
                                                                                variant="contained"
                                                                                startIcon={isActionProcessing ? <CircularProgress size={16} sx={{ color: BG_COLOR }} /> : <CheckCircleIcon />}
                                                                                onClick={() => handleApprove(alert)}
                                                                                disabled={isActionProcessing}
                                                                                sx={{
                                                                                    backgroundColor: APPROVE_COLOR,
                                                                                    color: BG_COLOR,
                                                                                    '&:hover': { backgroundColor: alpha(APPROVE_COLOR, 0.8) },
                                                                                    width: { xs: '50%', md: '120px' }
                                                                                }}
                                                                            >
                                                                                {isActionProcessing ? '승인 중' : '승인'}
                                                                            </Button>

                                                                            {/* 거절 버튼 (사유 입력 시 활성화) */}
                                                                            <Button
                                                                                variant="contained"
                                                                                startIcon={isActionProcessing ? <CircularProgress size={16} sx={{ color: BG_COLOR }} /> : <CancelIcon />}
                                                                                onClick={() => handleReject(alert)}
                                                                                disabled={!reason.trim() || isActionProcessing}
                                                                                sx={{
                                                                                    backgroundColor: REJECT_COLOR,
                                                                                    color: BG_COLOR,
                                                                                    '&:hover': { backgroundColor: alpha(REJECT_COLOR, 0.8) },
                                                                                    '&.Mui-disabled': { backgroundColor: alpha(REJECT_COLOR, 0.4), color: BG_COLOR },
                                                                                    width: { xs: '50%', md: '120px' }
                                                                                }}
                                                                            >
                                                                                {isActionProcessing ? '거절 중' : '거절'}
                                                                            </Button>
                                                                        </Box>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell></TableRow>
                                            </React.Fragment>
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