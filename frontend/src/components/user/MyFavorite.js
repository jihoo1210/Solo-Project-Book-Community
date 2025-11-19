// src/components/MyFavorite.js

import React, { useState, useEffect, useMemo } from 'react';
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
import ForumIcon from '@mui/icons-material/Forum'; 
import apiClient from '../../api/Api-Service';
import { getPostDateInfo } from '../utilities/DateUtiles'; 
import { BG_COLOR, HEADER_HEIGHT, LIGHT_TEXT_COLOR, MODIFIED_COLOR, PURPLE_COLOR, RED_COLOR, TEXT_COLOR, VIEW_SAVED_COLOR } from '../constants/Theme';

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

// 모바일 뷰에서 사용할 공통 스타일과 레이블 정의
const labelStyles = { fontWeight: 'bold', color: TEXT_COLOR, minWidth: '60px', marginRight: '8px' };

// 게시판 (activityType === 0) 모바일 레이블
const mobileLabels = ['ID', '주제', '제목', '작성자', '좋아요', '조회수', '작성일'];
// 댓글 (activityType === 1) 모바일 레이블
const commentMobileLabels = ['ID', '주제', '제목', '내용', '작성자', '좋아요', '작성일'];


// --- '내 활동' 컴포넌트 시작 ---
const MyFavorite = () => {
    const navigate = useNavigate();

    // 내 활동 타입 (0: 게시판, 1: 댓글)
    const [activityType, setActivityType] = useState(0); 

    // API 연동 및 데이터 관련 상태 (게시글 및 댓글 모두에 사용)
    const [items, setItems] = useState([]); // 게시글 또는 댓글 목록
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalItems, setTotalItems] = useState(0);

    // 필터링, 정렬, 페이지네이션 상태
    const [selectedTab, setSelectedTab] = useState(0); // 게시글 주제 탭 (전체, 질문, 공유, 모집)
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingSearchTerm, setPendingSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchField, setSearchField] = useState('제목'); // 게시판일 때만 '제목', '내용' 사용
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // 메뉴 Anchor 상태 (PostsList와 동일)
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const openSortMenu = Boolean(sortAnchorEl);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const openFilterMenu = Boolean(filterAnchorEl);
    const [perPageAnchorEl, setPerPageAnchorEl] = useState(null);
    const openPerPageMenu = Boolean(perPageAnchorEl);

    // --- API 호출 로직 ---
    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            setError(null);

            const pageNumberForBackend = page - 1;
            const sortParam = `id,${sortOrder}`;
            const sizeParam = `size=${rowsPerPage}`;
            
            let url = '';

            // 1. 게시판 (내가 즐겨찾기한 글)
            if (activityType === 0) { 
                const searchFieldParam = `searchField=${searchField}`;
                const searchTermParam = `searchTerm=${searchTerm}`;
                // 탭 필터링 (0은 '전체'이므로 필터링하지 않음)
                const tabParam = selectedTab > 0 ? `&tab=${selectedTab}` : '';
                
                // 가정: 내가 즐겨찾기한 게시글을 가져오는 API 엔드포인트
                url = `/posts/my/favorite?page=${pageNumberForBackend}&${sizeParam}&sort=${sortParam}&${searchFieldParam}&${searchTermParam}${tabParam}`;
            } 
            // 2. 댓글 (내가 즐겨찾기한 댓글)
            else { 
                // 댓글도 게시글과 동일하게 [제목, 내용] 검색 및 탭 필터링을 사용하도록 MyActives.js와 일관성을 유지합니다.
                const searchFieldParam = `searchField=${searchField}`; 
                const searchTermParam = `searchTerm=${searchTerm}`;
                // 탭 필터링 (0은 '전체'이므로 필터링하지 않음)
                const tabParam = selectedTab > 0 ? `&tab=${selectedTab}` : '';
                
                // 가정: 내가 즐겨찾기한 댓글을 가져오는 API 엔드포인트
                url = `/comment/my/favorite?page=${pageNumberForBackend}&${sizeParam}&sort=${sortParam}&${searchFieldParam}&${searchTermParam}${tabParam}`;
            }

            try {
                const response = await apiClient.get(url);
                const result = response.data.result;

                if (result && result.content && Array.isArray(result.content)) {
                    setItems(result.content);
                    setTotalItems(result.totalElements || 0);
                } else {
                    setItems([]);
                    setTotalItems(0);
                }

            } catch (error) {
                const errorMsg = error.response?.data?.message || "활동 내역을 불러오는 중 오류가 발생했습니다.";
                console.error("활동 내역 로드 오류:", errorMsg);
                setError(errorMsg);
                setItems([]);
                setTotalItems(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, [page, activityType, selectedTab, sortOrder, searchField, searchTerm, rowsPerPage]);

    // --- 이벤트 핸들러 ---
    
    // 게시판/댓글 탭 전환 핸들러
    const handleActivityTypeChange = (event, newValue) => {
        setActivityType(newValue);
        // 상태 초기화
        setPage(1);
        setSelectedTab(0);
        setSearchTerm('');
        setPendingSearchTerm('');
        setSearchField('제목'); // 기본 검색 필드로 초기화
    };

    // 게시글 주제 탭 전환 핸들러 (게시판/댓글 모두에서 사용)
    const handleSubjectTabChange = (event, newValue) => {
        setSelectedTab(newValue);
        setPage(1);
    };

    const handleSortClick = (event) => { setSortAnchorEl(event.currentTarget); };
    const handleSortClose = () => { setSortAnchorEl(null); };
    const handleSortOptionSelect = (order) => {
        setSortOrder(order);
        setPage(1);
        setSortAnchorEl(null);
    };

    // 검색 필드 선택 핸들러 (activityType이 '게시판'일 때만 '제목', '내용', '작성자' 사용 가능)
    const handleFilterClick = (event) => { setFilterAnchorEl(event.currentTarget); };
    const handleFilterClose = () => { setFilterAnchorEl(null); };
    const handleFilterOptionSelect = (field) => {
        setSearchField(field);
        setPage(1);
        setFilterAnchorEl(null);
    };

    // 페이지당 항목 수 메뉴 핸들러 (PostsList와 동일)
    const handlePerPageClick = (event) => { setPerPageAnchorEl(event.currentTarget); };
    const handlePerPageClose = () => { setPerPageAnchorEl(null); };
    const handlePerPageSelect = (value) => {
        setRowsPerPage(value);
        setPage(1);
        setPerPageAnchorEl(null);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    // 검색 실행 핸들러
    const handleSearchSubmit = () => {
        setSearchTerm(pendingSearchTerm);
        setPage(1);
    };

    // Row 클릭 핸들러: 게시글 또는 댓글이 속한 게시글로 이동
    const handleRowClick = (item) => {
        // 댓글/게시글 모두 게시글 ID를 통해 게시글 상세 페이지로 이동
        const targetId = activityType === 0 ? item.id : item.postId; 
        navigate(`/post/${targetId}?from=my-favorite`);
    };

    // 전체 항목 수와 페이지당 행 수를 기반으로 페이지 수 계산
    const pageCount = Math.ceil(totalItems / rowsPerPage);

    // --- 렌더링 로직 ---

    // 1. 테이블 헤더 정의
    const tableHeaders = useMemo(() => {
        if (activityType === 0) { // 게시판 (즐겨찾기한 글)
            return (
                <TableRow>
                    {/* PostsList.js와 동일한 컬럼 너비/개수 */}
                    <CustomTableCell sx={{ width: '5%' }}>ID</CustomTableCell>
                    <CustomTableCell sx={{ width: '8%' }}>주제</CustomTableCell>
                    <CustomTableCell sx={{ width: '42%' }}>제목</CustomTableCell>
                    <CustomTableCell sx={{ width: '15%' }}>작성자</CustomTableCell>
                    <CustomTableCell sx={{ width: '10%' }}>좋아요</CustomTableCell>
                    <CustomTableCell sx={{ width: '10%' }}>조회수</CustomTableCell>
                    <CustomTableCell sx={{ width: '10%' }}>작성일</CustomTableCell>
                </TableRow>
            );
        } else { // 댓글 (즐겨찾기한 댓글)
            // MyActives.js의 댓글 리스트와 동일하게 7개 컬럼 및 너비 설정
            // (ID: 5%, 주제: 8%, 제목: 30%, 내용: 15%, 작성자: 15%, 좋아요: 10%, 작성일: 17%)
            return (
                <TableRow>
                    <CustomTableCell sx={{ width: '5%' }}>ID</CustomTableCell>
                    <CustomTableCell sx={{ width: '8%' }}>주제</CustomTableCell>
                    <CustomTableCell sx={{ width: '32%' }}>제목</CustomTableCell>
                    <CustomTableCell sx={{ width: '20%' }}>댓글 내용</CustomTableCell>
                    <CustomTableCell sx={{ width: '15%' }}>작성자</CustomTableCell>
                    <CustomTableCell sx={{ width: '10%' }}>좋아요</CustomTableCell>
                    <CustomTableCell sx={{ width: '10%' }}>작성일</CustomTableCell>
                </TableRow>
            );
        }
    }, [activityType]);

    // 2. 모바일 검색 필터 메뉴 항목 정의
    const filterMenuItems = useMemo(() => {
        if (activityType === 0) { // 게시판
            return [
                <MenuItem key="post-title" onClick={() => handleFilterOptionSelect('제목')}>제목</MenuItem>,
                <MenuItem key="post-content" onClick={() => handleFilterOptionSelect('내용')}>내용</MenuItem>,
                <MenuItem key="post-author" onClick={() => handleFilterOptionSelect('작성자')}>작성자</MenuItem>,
            ];
        } else { // 댓글 - MyActives.js와 동일하게 제목, 내용 검색 허용
            return [
                <MenuItem key="comment-title" onClick={() => handleFilterOptionSelect('제목')}>제목</MenuItem>,
                <MenuItem key="comment-content" onClick={() => handleFilterOptionSelect('내용')}>내용</MenuItem>,
                <MenuItem key="comment-author" onClick={() => handleFilterOptionSelect('작성자')}>작성자</MenuItem>,
            ];
        }
    }, [activityType]);


    // 3. 테이블 바디 렌더링 (게시글/댓글 구분)
    const renderTableBody = () => {
        // 총 컬럼 수는 activityType에 따라 7개 또는 7개
        const colSpan = activityType === 0 ? 7 : 7; 

        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={colSpan} sx={{ textAlign: 'center', py: 5 }}>
                        <CircularProgress sx={{ color: TEXT_COLOR }} size={30} />
                        <Typography variant="body1" sx={{ mt: 1, color: LIGHT_TEXT_COLOR }}>활동 내역을 불러오는 중...</Typography>
                    </TableCell>
                </TableRow>
            );
        }

        if (error) {
            return (
                <TableRow>
                    <TableCell colSpan={colSpan} sx={{ textAlign: 'center', py: 5 }}>
                        <Typography variant="body1" color="error">{error}</Typography>
                    </TableCell>
                </TableRow>
            );
        }

        if (items.length === 0) {
            const emptyMessage = searchTerm
                ? `"${searchTerm}"에 대한 검색 결과가 없습니다.`
                : activityType === 0 ? '즐겨찾기한 게시글이 없습니다.' : '즐겨찾기한 댓글이 없습니다.';
            return (
                <TableRow>
                    <TableCell colSpan={colSpan} sx={{ textAlign: 'center', py: 5 }}>
                        <Typography variant="body1" sx={{ color: LIGHT_TEXT_COLOR }}>{emptyMessage}</Typography>
                    </TableCell>
                </TableRow>
            );
        }

        return items.map((item) => {
            // item.modifiedDate와 item.createdDate가 Post와 Comment 모두 있다고 가정
            const { dateDisplay, isModified } = getPostDateInfo(item.modifiedDate, item.createdDate);

            // 공통 TableRow 스타일 정의
            const rowSx = (theme) => ({
                textDecoration: 'none',
                '& > .MuiTableCell-root': { borderBottom: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` },
                '&:last-child > .MuiTableCell-root': { borderBottom: 'none' },
                '&:hover': {
                    backgroundColor: alpha(TEXT_COLOR, 0.05),
                    cursor: 'pointer'
                },
                // PostsList의 반응형 디자인 적용
                [theme.breakpoints.down('sm')]: {
                    display: 'block',
                    borderBottom: `1px solid ${TEXT_COLOR} !important`,
                    padding: theme.spacing(1, 0),
                    '& > .MuiTableCell-root': { borderBottom: 'none !important' },
                }
            });

            const isCommentMode = activityType === 1;
            
            // 3-1. 게시판 (즐겨찾기한 글) 렌더링 (기존 로직 유지)
            if (activityType === 0) { 
                const viewColor = item.savedInViews ? VIEW_SAVED_COLOR : LIGHT_TEXT_COLOR;
                const viewFontWeight = item.savedInViews ? 700 : 400;

                return (
                    <TableRow key={item.id} onClick={() => handleRowClick(item)} sx={rowSx}>
                        {/* ID (5%) */}
                        <TableCell component="th" scope="row"
                            sx={(theme) => ({
                                [theme.breakpoints.down('sm')]: {
                                    display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: LIGHT_TEXT_COLOR,
                                    padding: theme.spacing(0, 2, 0.5, 2), order: 7, '&::before': { content: `'${mobileLabels[0]}: '`, ...labelStyles }
                                }
                            })}
                        >{item.id}</TableCell>
                        {/* 주제 (8%) */}
                        <TableCell
                            sx={(theme) => ({
                                [theme.breakpoints.down('sm')]: {
                                    display: 'flex', justifyContent: 'flex-start',
                                    padding: theme.spacing(0.5, 2, 0, 2), order: 2,
                                }
                            })}
                        ><StyledChip label={item.subject} subject={item.subject} size="small" /></TableCell>
                        {/* 제목 (37%) */}
                        <TableCell sx={(theme) => ({
                            fontWeight: 600, color: TEXT_COLOR,
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                fontSize: '1rem', padding: theme.spacing(1, 2, 0.5, 2), order: 1,
                                whiteSpace: 'normal', wordBreak: 'break-word',
                            }
                        })}>
                            <Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                                {item.title}
                                {item.commentNumber > 0 && (<Typography component="span" sx={{ ml: 1, fontWeight: 600, color: RED_COLOR, fontSize: '0.8rem', flexShrink: 0 }}>[{item.commentNumber}]</Typography>)}
                            </Box>
                        </TableCell>
                        {/* 작성자 (15%) - PC만 표시 */}
                        <TableCell sx={(theme) => ({
                            color: LIGHT_TEXT_COLOR,
                            [theme.breakpoints.down('sm')]: { display: 'none' } 
                        })}>{item.username}</TableCell>
                        {/* 좋아요 수 (10%) */}
                        <TableCell sx={(theme) => ({
                            color: item.savedInLikes ? PURPLE_COLOR : RED_COLOR, fontWeight: 600,
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex', justifyContent: 'flex-start', alignItems: 'center',
                                fontSize: '0.85rem', padding: theme.spacing(0.5, 2, 0.5, 2), order: 5,
                                color: LIGHT_TEXT_COLOR, fontWeight: 400, '&::before': { content: `'${mobileLabels[4]}: '`, ...labelStyles }
                            }
                        })}>
                            <FavoriteIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', color: item.savedInLikes ? PURPLE_COLOR : RED_COLOR, mr: 0.5 }} />{item.likes || 0}
                        </TableCell>
                        {/* 조회수 (10%) */}
                        <TableCell sx={(theme) => ({
                            color: viewColor, fontWeight: viewFontWeight,
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex', justifyContent: 'flex-start', alignItems: 'center',
                                fontSize: '0.85rem', padding: theme.spacing(0.5, 2, 0.5, 2), order: 6,
                                '&::before': { content: `'${mobileLabels[5]}: '`, ...labelStyles }
                            }
                        })}>
                            <VisibilityIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', color: viewColor, mr: 0.5 }} />{item.viewCount || 0}
                        </TableCell>
                        {/* 작성일 (10%) */}
                        <TableCell sx={(theme) => ({
                            color: LIGHT_TEXT_COLOR,
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex', justifyContent: 'flex-start',
                                fontSize: '0.85rem', padding: theme.spacing(0.5, 2, 0.5, 2), order: 4,
                                '&::before': { content: `'${mobileLabels[6]}: '`, ...labelStyles }
                            }
                        })}>
                            <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                                {dateDisplay}
                                {isModified && (<Typography component="span" sx={{ ml: 0.5, fontWeight: 600, color: MODIFIED_COLOR, fontSize: '0.7rem', flexShrink: 0, whiteSpace: 'nowrap' }}>[수정됨]</Typography>)}
                            </Box>
                        </TableCell>
                    </TableRow>
                );
            } 
            // 3-2. 댓글 (즐겨찾기한 댓글) 렌더링
            else { 
                // 가정: item은 { id(댓글 ID), postId, postTitle, content, createdDate, modifiedDate, subject, username, likes, commentNumber } 구조
                return (
                    <TableRow key={item.id} onClick={() => handleRowClick(item)} sx={rowSx}>
                        {/* ID (댓글 ID) - 5% */}
                        <TableCell component="th" scope="row"
                            sx={(theme) => ({
                                [theme.breakpoints.down('sm')]: {
                                    display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: LIGHT_TEXT_COLOR,
                                    padding: theme.spacing(0, 2, 0.5, 2), order: 7, 
                                    '&::before': { content: `'${commentMobileLabels[0]}: '`, ...labelStyles } // ID
                                }
                            })}
                        >{item.id}</TableCell> 
                        {/* 주제 - 8% */}
                        <TableCell
                            sx={(theme) => ({
                                [theme.breakpoints.down('sm')]: {
                                    display: 'flex', justifyContent: 'flex-start',
                                    padding: theme.spacing(0.5, 2, 0, 2), order: 2,
                                }
                            })}
                        ><StyledChip label={item.subject} subject={item.subject} size="small" /></TableCell>
                        {/* 제목 (게시글 제목) - 37% */}
                        <TableCell sx={(theme) => ({
                            fontWeight: 600, color: TEXT_COLOR,
                            maxWidth: isCommentMode ? '200px' : 'none', 
                            whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis',
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                fontSize: '1rem', padding: theme.spacing(1, 2, 0.5, 2), order: 1,
                                whiteSpace: 'normal', wordBreak: 'break-word',
                                '&::before': { content: `'${commentMobileLabels[2]}: '`, ...labelStyles } // 제목
                            }
                        })}>
                            <Box component="span" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                                {item.postTitle}
                                {item.commentNumber > 0 && (<Typography component="span" sx={{ ml: 1, fontWeight: 600, color: RED_COLOR, fontSize: '0.8rem', flexShrink: 0 }}>[{item.commentNumber}]</Typography>)}
                            </Box>
                        </TableCell>
                        {/* 댓글 내용 - 15% */}
                        <TableCell sx={(theme) => ({
                            color: LIGHT_TEXT_COLOR, 
                            maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex', justifyContent: 'flex-start',
                                fontSize: '0.85rem', padding: theme.spacing(0.5, 2, 0.5, 2), order: 3,
                                '&::before': { content: `'${commentMobileLabels[3]}: '`, ...labelStyles } // 내용
                            }
                        })}>
                            <ForumIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', color: TEXT_COLOR, mr: 0.5 }} />
                            {item.content}
                        </TableCell>
                        {/* 작성자 - 15% */}
                        <TableCell sx={(theme) => ({
                            color: LIGHT_TEXT_COLOR,
                            [theme.breakpoints.down('sm')]: { 
                                display: 'flex', justifyContent: 'flex-start',
                                fontSize: '0.85rem', padding: theme.spacing(0.5, 2, 0.5, 2), order: 4,
                                '&::before': { content: `'${commentMobileLabels[4]}: '`, ...labelStyles } // 작성자
                            }
                        })}>{item.username}</TableCell>
                        {/* 좋아요 수 - 10% */}
                        <TableCell sx={(theme) => ({
                            color: item.savedInLikes ? PURPLE_COLOR : RED_COLOR, fontWeight: 600,
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex', justifyContent: 'flex-start', alignItems: 'center',
                                fontSize: '0.85rem', padding: theme.spacing(0.5, 2, 0.5, 2), order: 6, // 순서 조정
                                color: LIGHT_TEXT_COLOR, fontWeight: 400, 
                                '&::before': { content: `'${commentMobileLabels[5]}: '`, ...labelStyles } // 좋아요
                            }
                        })}>
                            <FavoriteIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', color: item.savedInLikes ? PURPLE_COLOR : RED_COLOR, mr: 0.5 }} />{item.likes || 0}
                        </TableCell>
                        {/* 작성일 - 10% */}
                        <TableCell sx={(theme) => ({
                            color: LIGHT_TEXT_COLOR,
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex', justifyContent: 'flex-start',
                                fontSize: '0.85rem', padding: theme.spacing(0.5, 2, 0.5, 2), order: 5, // 순서 조정
                                '&::before': { content: `'${commentMobileLabels[6]}: '`, ...labelStyles } // 작성일
                            }
                        })}>
                            <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                                {dateDisplay}
                                {isModified && (<Typography component="span" sx={{ ml: 0.5, fontWeight: 600, color: MODIFIED_COLOR, fontSize: '0.7rem', flexShrink: 0, whiteSpace: 'nowrap' }}>[수정됨]</Typography>)}
                            </Box>
                        </TableCell>
                    </TableRow>
                );
            }
        });
    };
    
    // 4. 게시글 주제 탭 렌더링 (게시판/댓글 모드 모두 표시되도록 수정)
    const renderSubjectTabs = () => {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: { xs: 'flex-start', md: 'flex-start' },
                overflowX: { xs: 'hidden', md: 'visible' },
            }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleSubjectTabChange}
                    aria-label="게시글 주제 탭"
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        width: { xs: '100%', md: 'auto' },
                        '& .MuiTabs-indicator': { backgroundColor: TEXT_COLOR },
                        overflowX: 'hidden',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    <CustomTab label="전체" value={0} />
                    <CustomTab label="질문" value={1} />
                    <CustomTab label="공유" value={2} />
                    <CustomTab label="모집" value={3} />
                </Tabs>
            </Box>
        );
    };


    return (
        <PostsListWrapper>
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    align="left"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 4, color: TEXT_COLOR, fontSize: { xs: '2rem', md: '2.5rem' }, textAlign: {xs: 'center', md: 'left'} }}
                >
                    즐겨찾기
                </Typography>
                <PostsCard elevation={0}>
                    {/* 상위: 게시판 / 댓글 전환 탭 */}
                    <Box sx={{ mb: 3, borderBottom: `1px solid ${alpha(TEXT_COLOR, 0.2)}` }}>
                        <Tabs
                            value={activityType}
                            onChange={handleActivityTypeChange}
                            aria-label="내 활동 유형 탭"
                            sx={{ '& .MuiTabs-indicator': { backgroundColor: TEXT_COLOR, height: '2px' } }}
                        >
                            <Tab label="게시판" value={0} sx={{ fontWeight: 700, color: TEXT_COLOR, width: {xs: '50% !important', md: 'auto !important'} }} />
                            <Tab label="댓글" value={1} sx={{ fontWeight: 700, color: TEXT_COLOR, width: {xs: '50% !important', md: 'auto !important'}  }} />
                        </Tabs>
                    </Box>

                    {/* 중위: 게시글 주제 탭 (게시판/댓글 모드 모두 표시) */}
                    <Box sx={{ mb: 3 }}>
                        {renderSubjectTabs()}
                    </Box>

                    {/* 하위: 검색, 정렬 및 목록 표시 영역 */}
                    <Box
                        sx={(theme) => ({
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            [theme.breakpoints.down('sm')]: {
                                padding: theme.spacing(0, 2),
                            },
                        })}
                    >
                        {/* 정렬, 검색 버튼 영역 */}
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
                                <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', md: 'auto' }, justifyContent: 'flex-start' }}>
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
                                        {sortOrder === 'desc' ? '최신순' : '오래된순'}
                                    </FilterButton>
                                    {/* 정렬 메뉴 */}
                                    <Menu anchorEl={sortAnchorEl} open={openSortMenu} onClose={handleSortClose} id="sort-menu"
                                        slotProps={{ paper: { sx: { border: `1px solid ${TEXT_COLOR}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } } }}>
                                        <MenuItem onClick={() => handleSortOptionSelect('desc')}>내림차순 (최신순)</MenuItem>
                                        <MenuItem onClick={() => handleSortOptionSelect('asc')}>오름차순 (오래된순)</MenuItem>
                                    </Menu>

                                    {/* 검색 필드 선택 버튼 (댓글 모드에서는 '제목'/'내용' 선택 가능) */}
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
                                    <Menu anchorEl={filterAnchorEl} open={openFilterMenu} onClose={handleFilterClose} id="filter-menu"
                                        slotProps={{ paper: { sx: { border: `1px solid ${TEXT_COLOR}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } } }}>
                                        {filterMenuItems}
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
                                    sx={{ minWidth: { xs: '100%', md: '200px' }, flexGrow: 1, mt: { xs: 1, md: 0 } }}
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
                                    sx={{ width: { xs: '100%', md: '100px' } }}
                                >
                                    {rowsPerPage}개씩 보기
                                </FilterButton>
                                {/* Rows Per Page 메뉴 */}
                                <Menu anchorEl={perPageAnchorEl} open={openPerPageMenu} onClose={handlePerPageClose} id="per-page-menu"
                                    slotProps={{ paper: { sx: { border: `1px solid ${TEXT_COLOR}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } } }}>
                                    {[10, 15, 30, 50].map((count) => (
                                        <MenuItem key={count} onClick={() => handlePerPageSelect(count)} selected={count === rowsPerPage}>
                                            {count}개씩 보기
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                            
                            {/* 글쓰기 버튼 (게시판 모드일 때만 표시) */}
                            {activityType === 0 && (
                                <ActionButton variant="contained" component={Link} to="/post/create" sx={{ width: { xs: '100%', md: 'auto' } }}>
                                    글쓰기
                                </ActionButton>
                            )}
                        </Box>
                    </Box>

                    {/* 게시글/댓글 테이블 */}
                    <TableContainer component={Paper} elevation={0}
                        sx={(theme) => ({
                            border: `1px solid ${TEXT_COLOR}`,
                            marginTop: theme.spacing(3),
                            [theme.breakpoints.down('sm')]: { marginX: theme.spacing(2), width: `calc(100% - ${theme.spacing(4)})` },
                        })}
                    >
                        <Table aria-label="내 활동 목록">
                            <TableHead>{tableHeaders}</TableHead>
                            <TableBody>{renderTableBody()}</TableBody>
                        </Table>
                    </TableContainer>

                    {/* 페이지네이션 컴포넌트 */}
                    {pageCount > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination count={pageCount} page={page} onChange={handlePageChange} color="primary"
                                sx={{
                                    '& .MuiPaginationItem-root.Mui-selected': { backgroundColor: TEXT_COLOR, color: BG_COLOR, '&:hover': { backgroundColor: LIGHT_TEXT_COLOR } },
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

export default MyFavorite;