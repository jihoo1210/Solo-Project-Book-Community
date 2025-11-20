// src/components/AdminPage.js

import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab,
    Chip,
    Pagination,
    TextField,
    InputAdornment,
    IconButton,
    Menu,
    MenuItem,
    CircularProgress,
    Collapse,
    Grid,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ForumIcon from "@mui/icons-material/Forum";
import apiClient from "../../api/Api-Service";
import {
    BG_COLOR,
    HEADER_HEIGHT,
    LIGHT_TEXT_COLOR,
    MODIFIED_COLOR,
    PURPLE_COLOR,
    RED_COLOR,
    TEXT_COLOR,
    VIEW_SAVED_COLOR,
} from "../constants/Theme";
import { formatTimeOrDate, getPostDateInfo } from "../utilities/DateUtiles";
import {
    BlockOutlined,
    Delete,
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthContext";

// 스타일 컴포넌트 정의
const PostsListWrapper = styled(Box)(({ theme }) => ({
    marginTop: HEADER_HEIGHT,
    backgroundColor: BG_COLOR,
    padding: theme.spacing(4, 0),
}));

const PostsCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: (theme.shape?.borderRadius || 4) * 2,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: `1px solid ${TEXT_COLOR}`,
    backgroundColor: BG_COLOR,

    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(2, 0),
    },
}));

const CustomTab = styled(Tab)(({ theme }) => ({
    color: TEXT_COLOR,
    fontWeight: 600,
    flexShrink: 1,
    minWidth: "80px",
    padding: "12px 16px",
    [theme.breakpoints.down("sm")]: {
        minWidth: "25%",
        padding: 0,
    },
}));

const CustomSearchField = styled(TextField)(({ theme }) => ({
    minWidth: 150,
    "& .MuiInputLabel-root": { color: LIGHT_TEXT_COLOR },
    "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: TEXT_COLOR },
        "&:hover fieldset": { borderColor: TEXT_COLOR },
        "&.Mui-focused fieldset": {
            borderColor: TEXT_COLOR,
            borderWidth: "1px",
        },
    },
}));

const FilterButton = styled(Button)(({ theme }) => ({
    color: TEXT_COLOR,
    borderColor: TEXT_COLOR,
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    minWidth: "auto",
    whiteSpace: "nowrap",
    "&:hover": {
        borderColor: TEXT_COLOR,
        backgroundColor: alpha(TEXT_COLOR, 0.05),
    },
}));

const CustomTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 700,
    color: TEXT_COLOR,
    backgroundColor: alpha(TEXT_COLOR, 0.03),
    borderBottom: `1px solid ${TEXT_COLOR}`,
    fontSize: "1rem",
    [theme.breakpoints.down("sm")]: {
        display: "none",
    },
}));

const StyledChip = styled(Chip)(({ theme, subject }) => {
    let chipColor;
    switch (subject) {
        case "질문":
            chipColor = "#FFC107";
            break;
        case "모집":
            chipColor = "#4CAF50";
            break;
        case "공유":
        default:
            chipColor = "#2196F3";
            break;
    }
    return {
        backgroundColor: chipColor,
        color: BG_COLOR,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: "24px",
    };
});

// 모바일 뷰에서 사용할 공통 스타일과 레이블 정의
const labelStyles = {
    fontWeight: "bold",
    color: TEXT_COLOR,
    minWidth: "60px",
    marginRight: "8px",
};

// 게시글 관리 (activityType === 0) 모바일 레이블
const mobileLabels = [
    "ID",
    "주제",
    "제목",
    "작성자",
    "좋아요",
    "조회수",
    "작성일",
];
// 댓글 관리 (activityType === 1) 모바일 레이블
const commentMobileLabels = [
    "ID",
    "주제",
    "제목",
    "내용",
    "작성자",
    "좋아요",
    "작성일",
];
const userMobileLabels = ["ID", "회원명", "이메일", "생성일"];

// --- '관리자 페이지' 컴포넌트 시작 ---
const AdminPage = () => {
    const { user } = useAuth();

    // 관리 대상 타입 (0: 게시글, 1: 댓글)
    const [activityType, setActivityType] = useState(0);

    // API 연동 및 데이터 관련 상태 (게시글 및 댓글 모두에 사용)
    const [items, setItems] = useState([]); // 게시글 또는 댓글 목록
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalItems, setTotalItems] = useState(0);

    // 필터링, 정렬, 페이지네이션 상태
    const [selectedTab, setSelectedTab] = useState(0); // 게시글 주제 탭 (전체, 질문, 공유, 모집)
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [pendingSearchTerm, setPendingSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [searchField, setSearchField] = useState("제목"); // '제목', '내용', '작성자' 사용
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // 메뉴 Anchor 상태 (PostsList와 동일)
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const openSortMenu = Boolean(sortAnchorEl);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const openFilterMenu = Boolean(filterAnchorEl);
    const [perPageAnchorEl, setPerPageAnchorEl] = useState(null);
    const openPerPageMenu = Boolean(perPageAnchorEl);

    // 아코디언 확장 상태
    const [expandedItemId, setExpandedItemId] = useState(null);

    const fetchItems = async (page, activityType, selectedTab, sortOrder, searchField, searchTerm, rowsPerPage) => {
        setIsLoading(true);
        setError(null);

        const pageNumberForBackend = page - 1;
        const sortParam = `id,${sortOrder}`;
        const sizeParam = `size=${rowsPerPage}`;

        let url = "";

        // 검색/필터링 파라미터 구성
        const searchFieldParam = `searchField=${searchField}`;
        const searchTermParam = `searchTerm=${searchTerm}`;
        // 탭 필터링 (0은 '전체'이므로 필터링하지 않음)
        const tabParam = selectedTab > 0 ? `&tab=${selectedTab}` : "";

        // 1. 게시글 관리 (activityType === 0)
        if (activityType === 0) {
            // 요청: /admin/posts?...
            url = `/admin/posts?page=${pageNumberForBackend}&${sizeParam}&sort=${sortParam}&${searchFieldParam}&${searchTermParam}${tabParam}`;
        }
        // 2. 댓글 관리 (activityType === 1)
        else if (activityType === 1) {
            // 요청: /admin/comment?...
            url = `/admin/comment?page=${pageNumberForBackend}&${sizeParam}&sort=${sortParam}&${searchFieldParam}&${searchTermParam}${tabParam}`;
        } else {
            url = `/admin/user?page=${pageNumberForBackend}&${sizeParam}&${sortParam}&${searchFieldParam}&${searchTermParam}`;
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
            const errorMsg =
                error.response?.data?.message ||
                "관리 목록을 불러오는 중 오류가 발생했습니다.";
            console.error("관리 목록 로드 오류:", errorMsg);
            setError(errorMsg);
            setItems([]);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    };

    // --- API 호출 로직 ---
    useEffect(() => {
        fetchItems(page, activityType, selectedTab, sortOrder, searchField, searchTerm, rowsPerPage);
    }, [
        page,
        activityType,
        selectedTab,
        sortOrder,
        searchField,
        searchTerm,
        rowsPerPage,
    ]);

    // --- 이벤트 핸들러 ---

    // 게시글/댓글 탭 전환 핸들러
    const handleActivityTypeChange = (event, newValue) => {
        setActivityType(newValue);
        // 상태 초기화
        setExpandedItemId(null)
        setPage(1);
        setSelectedTab(0);
        setSearchTerm("");
        setPendingSearchTerm("");
        setSearchField(newValue !== 2 ? "제목" : "회원명"); // 기본 검색 필드로 초기화
    };

    // 게시글 주제 탭 전환 핸들러 (게시글/댓글 모두에서 사용)
    const handleSubjectTabChange = (event, newValue) => {
        setExpandedItemId(null)
        setSelectedTab(newValue);
        setPage(1);
    };

    const handleSortClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };
    const handleSortClose = () => {
        setSortAnchorEl(null);
    };
    const handleSortOptionSelect = (order) => {
        setSortOrder(order);
        setPage(1);
        setSortAnchorEl(null);
    };

    // 검색 필드 선택 핸들러
    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };
    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };
    const handleFilterOptionSelect = (field) => {
        setSearchField(field);
        setPage(1);
        setFilterAnchorEl(null);
    };

    // 페이지당 항목 수 메뉴 핸들러
    const handlePerPageClick = (event) => {
        setPerPageAnchorEl(event.currentTarget);
    };
    const handlePerPageClose = () => {
        setPerPageAnchorEl(null);
    };
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

    // Row 클릭 핸들러: 게시글 또는 댓글이 속한 게시글로 이동 (관리자 페이지이므로 상세 페이지 이동 유지)
    const handleRowClick = (item, event) => {
        if (
            event.target.closest("button") ||
            event.target.closest("input") ||
            event.target.closest("textarea")
        ) {
            return;
        }

        // 확장/축소 토글 로직
        if (expandedItemId === item.id) {
            setExpandedItemId(null);
        } else {
            setExpandedItemId(item.id);
        }
    };

    // 신고된 객체 제거
    const handlePermanentDelete = async (item) => {

        const baseUrl = '/admin'

        let objectType = '';
        if (activityType === 0) {
            objectType = 'posts'
        } else if (activityType === 1) {
            objectType = 'comment'
        } else if (activityType === 2) {
            objectType = 'user'
        } else {
            console.log(objectType)
        }

        const id = item.id
        if (id && objectType) {
            const url = `${baseUrl}/${objectType}/${id}`
            try {
                await apiClient.delete(url)
                console.log("정상적으로 삭제되었습니다.")
                fetchItems(page, activityType, selectedTab, sortOrder, searchField, searchTerm, rowsPerPage)
            } catch (error) {
                console.log("error", error.response?.data?.message)
            }
        } else {
            console.log("item", item)
        }
    }

    // 신고 무시
    const handleIgnoreReport = async (item) => {
        const baseUrl = '/admin/ignore'

        let objectType = '';
        if (activityType === 0) {
            objectType = 'posts'
        } else if (activityType === 1) {
            objectType = 'comment'
        } else if (activityType === 2) {
            objectType = 'user'
        } else {
            console.log(objectType)
        }

        const id = item.id
        if (id && objectType) {
            const url = `${baseUrl}/${objectType}/${id}`
            try {
                await apiClient.delete(url)
                console.log("정상적으로 무시되었습니다.")
                fetchItems(page, activityType, selectedTab, sortOrder, searchField, searchTerm, rowsPerPage)
            } catch (error) {
                console.log("error", error.response?.data?.message)
            }
        } else {
            console.log("item", item)
        }
    }

    // 전체 항목 수와 페이지당 행 수를 기반으로 페이지 수 계산
    const pageCount = Math.ceil(totalItems / rowsPerPage);

    // --- 렌더링 로직 ---

    // 1. 테이블 헤더 정의
    const tableHeaders = useMemo(() => {
        if (activityType === 0) {
            // 게시글 관리
            return (
                <TableRow>
                    {/* PostsList.js와 동일한 컬럼 너비/개수 */}
                    <CustomTableCell sx={{ width: "5%" }}>ID</CustomTableCell>
                    <CustomTableCell sx={{ width: "8%" }}>주제</CustomTableCell>
                    <CustomTableCell sx={{ width: "40%" }}>제목</CustomTableCell>
                    <CustomTableCell sx={{ width: "15%" }}>작성자</CustomTableCell>
                    <CustomTableCell sx={{ width: "10%" }}>좋아요</CustomTableCell>
                    <CustomTableCell sx={{ width: "10%" }}>조회수</CustomTableCell>
                    <CustomTableCell sx={{ width: "12%" }}>작성일</CustomTableCell>
                </TableRow>
            );
        } else if (activityType === 1) {
            // 댓글 관리
            // 컬럼 너비 설정 (ID: 5%, 주제: 8%, 제목: 32%, 내용: 20%, 작성자: 15%, 좋아요: 10%, 작성일: 10%)
            return (
                <TableRow>
                    <CustomTableCell sx={{ width: "5%" }}>ID</CustomTableCell>
                    <CustomTableCell sx={{ width: "8%" }}>주제</CustomTableCell>
                    <CustomTableCell sx={{ width: "30%" }}>제목</CustomTableCell>
                    <CustomTableCell sx={{ width: "20%" }}>댓글 내용</CustomTableCell>
                    <CustomTableCell sx={{ width: "15%" }}>작성자</CustomTableCell>
                    <CustomTableCell sx={{ width: "10%" }}>좋아요</CustomTableCell>
                    <CustomTableCell sx={{ width: "12%" }}>작성일</CustomTableCell>
                </TableRow>
            );
        } else {
            return (
                <TableRow>
                    <CustomTableCell sx={{ width: "5%" }}>ID</CustomTableCell>
                    <CustomTableCell sx={{ width: "35%" }}>회원명</CustomTableCell>
                    <CustomTableCell sx={{ width: "48%" }}>이메일</CustomTableCell>
                    <CustomTableCell sx={{ width: "12%" }}>생성일</CustomTableCell>
                </TableRow>
            );
        }
    }, [activityType]);

    // 2. 모바일 검색 필터 메뉴 항목 정의
    const filterMenuItems = useMemo(() => {
        // 게시글/댓글 모두 제목, 내용, 작성자 검색 허용
        if (activityType !== 2) {
            return [
                <MenuItem key="title" onClick={() => handleFilterOptionSelect("제목")}>
                    제목
                </MenuItem>,
                <MenuItem
                    key="content"
                    onClick={() => handleFilterOptionSelect("내용")}
                >
                    내용
                </MenuItem>,
                <MenuItem
                    key="author"
                    onClick={() => handleFilterOptionSelect("작성자")}
                >
                    작성자
                </MenuItem>,
            ];
        } else {
            return [
                <MenuItem
                    key="username"
                    onClick={() => handleFilterOptionSelect("회원명")}
                >
                    회원명
                </MenuItem>,
                <MenuItem
                    key="email"
                    onClick={() => handleFilterOptionSelect("이메일")}
                >
                    이메일
                </MenuItem>,
            ];
        }
    }, [activityType]);

    // collapse
    const collapseItem = (item) => {
        const isUser = activityType === 2;
        const isCurrentUser = isUser && item.username === user.username;
        return (
            <Box
                sx={(theme) => ({
                    display: "flex",
                    gap: 2,
                    p: 4,
                    flexDirection: "column",
                    borderTop: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.2)}`,
                    [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
                })}
            >

                {/* 1. 알림 내용 전체 표시 (짤림 없이) - 신청 타입의 디자인을 모든 타입에 적용 */}
                {activityType === 1 &&<Box sx={{
                    width: '100%',
                    minHeight: '100px',
                    p: 0,
                    mb: 1, // 신청 타입일 때만 아래 여백 추가
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
                        {'\t' + item.content || '알림 내용이 없습니다.'}
                    </Typography>
                </Box>
    }

                <Grid container spacing={2}>
                    <Grid size={{ xs: 0, sm: 3 }} />
                    {/* 영구 삭제 버튼 */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <Button
                            size="large"
                            fullWidth
                            variant="contained"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => handlePermanentDelete(item)}
                            sx={{ fontWeight: 600 }}
                            disabled={isCurrentUser}
                        >
                            영구 삭제
                        </Button>
                    </Grid>

                    {/* 신고 무시 버튼 */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <Button
                            size="large"
                            fullWidth
                            variant="outlined"
                            color="secondary"
                            startIcon={<BlockOutlined />}
                            onClick={() => handleIgnoreReport(item)}
                            sx={{
                                fontWeight: 600,
                                borderColor: TEXT_COLOR,
                                color: TEXT_COLOR,
                                "&:hover": { backgroundColor: alpha(TEXT_COLOR, 0.05) },
                            }}
                            disabled={isUser}
                        >
                            신고 무시
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // 3. 테이블 바디 렌더링 (게시글/댓글 구분)
    const renderTableBody = () => {
        // 총 컬럼 수는 activityType에 따라 7개 또는 7개
        const colSpan = activityType === 0 ? 7 : 7;

        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={colSpan} sx={{ textAlign: "center", py: 5 }}>
                        <CircularProgress sx={{ color: TEXT_COLOR }} size={30} />
                        <Typography variant="body1" sx={{ mt: 1, color: LIGHT_TEXT_COLOR }}>
                            관리 목록을 불러오는 중...
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        }

        if (error) {
            return (
                <TableRow>
                    <TableCell colSpan={colSpan} sx={{ textAlign: "center", py: 5 }}>
                        <Typography variant="body1" color="error">
                            {error}
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        }

        if (items.length === 0) {
            const emptyMessage = searchTerm
                ? `"${searchTerm}"에 대한 검색 결과가 없습니다.`
                : activityType === 0
                    ? "신고된 게시글이 없습니다."
                    : "신고된 댓글이 없습니다.";
            return (
                <TableRow>
                    <TableCell colSpan={colSpan} sx={{ textAlign: "center", py: 5 }}>
                        <Typography variant="body1" sx={{ color: LIGHT_TEXT_COLOR }}>
                            {emptyMessage}
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        }

        return items.map((item) => {
            // item.modifiedDate와 item.createdDate가 Post와 Comment 모두 있다고 가정
            const { dateDisplay, isModified } = getPostDateInfo(
                item.modifiedDate,
                item.createdDate
            );
            const isExpanded = expandedItemId === item.id; // 확장 상태 확인

            // 공통 TableRow 스타일 정의
            const rowSx = (theme) => ({
                textDecoration: "none",
                "& > .MuiTableCell-root": {
                    borderBottom: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}`,
                },
                "&:last-child > .MuiTableCell-root": { borderBottom: "none" },
                "&:hover": {
                    backgroundColor: alpha(TEXT_COLOR, 0.05),
                    cursor: "pointer",
                },
                // PostsList의 반응형 디자인 적용
                [theme.breakpoints.down("sm")]: {
                    display: "block",
                    borderBottom: `1px solid ${TEXT_COLOR} !important`,
                    padding: theme.spacing(1, 0),
                    "& > .MuiTableCell-root": { borderBottom: "none !important" },
                },
            });

            const currentColSpan = activityType === 0 || activityType === 1 ? 7 : 4;

            // 3-1. 게시글 관리 렌더링
            if (activityType === 0) {
                const viewColor = item.savedInViews
                    ? VIEW_SAVED_COLOR
                    : LIGHT_TEXT_COLOR;
                const viewFontWeight = item.savedInViews ? 700 : 400;

                return (
                    <React.Fragment key={item.id}>
                        <TableRow
                            onClick={(event) => handleRowClick(item, event)}
                            sx={rowSx}
                            aria-label={`게시글 ID ${item.id}`}
                        >
                            {/* ID (5%) */}
                            <TableCell
                                component="th"
                                scope="row"
                                sx={(theme) => ({
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "0.8rem",
                                        color: LIGHT_TEXT_COLOR,
                                        padding: theme.spacing(0, 2, 0.5, 2),
                                        order: 7,
                                        "&::before": {
                                            content: `'${mobileLabels[0]}: '`,
                                            ...labelStyles,
                                        },
                                    },
                                })}
                            >
                                {item.id}
                            </TableCell>
                            {/* 주제 (8%) */}
                            <TableCell
                                sx={(theme) => ({
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        padding: theme.spacing(0.5, 2, 0, 2),
                                        order: 2,
                                    },
                                })}
                            >
                                <StyledChip
                                    label={item.subject}
                                    subject={item.subject}
                                    size="small"
                                />
                            </TableCell>
                            {/* 제목 (42%) */}
                            <TableCell
                                sx={(theme) => ({
                                    fontWeight: 600,
                                    color: TEXT_COLOR,
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        fontSize: "1rem",
                                        padding: theme.spacing(1, 2, 0.5, 2),
                                        order: 1,
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                    },
                                })}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        flexGrow: 1,
                                        minWidth: 0,
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {item.title}
                                    {item.commentNumber > 0 && (
                                        <Typography
                                            component="span"
                                            sx={{
                                                ml: 1,
                                                fontWeight: 600,
                                                color: RED_COLOR,
                                                fontSize: "0.8rem",
                                                flexShrink: 0,
                                            }}
                                        >
                                            [{item.commentNumber}]
                                        </Typography>
                                    )}
                                </Box>
                            </TableCell>
                            {/* 작성자 (15%) - PC만 표시 */}
                            <TableCell
                                sx={(theme) => ({
                                    color: LIGHT_TEXT_COLOR,
                                    [theme.breakpoints.down("sm")]: { display: "none" },
                                })}
                            >
                                {item.username}
                            </TableCell>
                            {/* 좋아요 수 (10%) */}
                            <TableCell
                                sx={(theme) => ({
                                    color: item.savedInLikes ? PURPLE_COLOR : RED_COLOR,
                                    fontWeight: 600,
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        alignItems: "center",
                                        fontSize: "0.85rem",
                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                        order: 5,
                                        color: LIGHT_TEXT_COLOR,
                                        fontWeight: 400,
                                        "&::before": {
                                            content: `'${mobileLabels[4]}: '`,
                                            ...labelStyles,
                                        },
                                    },
                                })}
                            >
                                <FavoriteIcon
                                    sx={{
                                        fontSize: "1rem",
                                        verticalAlign: "middle",
                                        mr: 0.5,
                                        color: item.savedInLikes ? PURPLE_COLOR : RED_COLOR,
                                    }}
                                />
                                {item.likes || 0}
                            </TableCell>
                            {/* 조회수 (10%) */}
                            <TableCell
                                sx={(theme) => ({
                                    color: viewColor,
                                    fontWeight: viewFontWeight,
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        alignItems: "center",
                                        fontSize: "0.85rem",
                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                        order: 6,
                                        "&::before": {
                                            content: `'${mobileLabels[5]}: '`,
                                            ...labelStyles,
                                        },
                                    },
                                })}
                            >
                                <VisibilityIcon
                                    sx={{
                                        fontSize: "1rem",
                                        verticalAlign: "middle",
                                        color: viewColor,
                                        mr: 0.5,
                                    }}
                                />
                                {item.viewCount || 0}
                            </TableCell>
                            {/* 작성일 (10%) */}
                            <TableCell
                                sx={(theme) => ({
                                    color: LIGHT_TEXT_COLOR,
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        fontSize: "0.85rem",
                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                        order: 4,
                                        "&::before": {
                                            content: `'${mobileLabels[6]}: '`,
                                            ...labelStyles,
                                        },
                                    },
                                })}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        whiteSpace: "nowrap",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span>
                                        {dateDisplay}
                                        {isModified && (
                                            <Typography
                                                component="span"
                                                sx={{
                                                    ml: 0.5,
                                                    fontWeight: 600,
                                                    color: MODIFIED_COLOR,
                                                    fontSize: "0.7rem",
                                                    flexShrink: 0,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                [수정됨]
                                            </Typography>
                                        )}
                                    </span>
                                    {/* [NEW] Accordion Icon */}
                                    <IconButton
                                        size="small"
                                        sx={{
                                            ml: 1,
                                            p: 0,
                                            color: TEXT_COLOR,
                                            transform: isExpanded ? "rotate(360deg)" : "rotate(0deg)",
                                            transition: "transform 0.3s",
                                            "&:hover": { backgroundColor: "transparent" },
                                        }}
                                    >
                                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell
                                colSpan={currentColSpan}
                                sx={{
                                    display: { xs: "block", md: "table-cell" },
                                    p: 0,
                                    borderBottom: isExpanded
                                        ? `1px solid ${TEXT_COLOR} !important`
                                        : "none !important",
                                }}
                            >
                                <Collapse in={isExpanded} timeout={300} unmountOnExit>
                                    {collapseItem(item)}
                                </Collapse>
                            </TableCell>
                        </TableRow>
                    </React.Fragment>
                );
            }
            // 3-2. 댓글 관리 렌더링
            else if (activityType === 1) {
                return (
                    <React.Fragment key={item.id}>
                        <TableRow
                            onClick={(event) => handleRowClick(item, event)}
                            sx={rowSx}
                            aria-label={`댓글 ID ${item.id}`}
                        >
                            {/* ID (댓글 ID) - 5% */}
                            <TableCell
                                component="th"
                                scope="row"
                                sx={(theme) => ({
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "0.8rem",
                                        color: LIGHT_TEXT_COLOR,
                                        padding: theme.spacing(0, 2, 0.5, 2),
                                        order: 7,
                                        "&::before": {
                                            content: `'${commentMobileLabels[0]}: '`,
                                            ...labelStyles,
                                        }, // ID
                                    },
                                })}
                            >
                                {item.id}
                            </TableCell>
                            {/* 주제 - 8% */}
                            <TableCell
                                sx={(theme) => ({
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        padding: theme.spacing(0.5, 2, 0, 2),
                                        order: 2,
                                    },
                                })}
                            >
                                <StyledChip
                                    label={item.subject}
                                    subject={item.subject}
                                    size="small"
                                />
                            </TableCell>
                            {/* 제목 (게시글 제목) - 32% */}
                            <TableCell
                                sx={(theme) => ({
                                    fontWeight: 600,
                                    color: TEXT_COLOR,
                                    maxWidth: "200px",
                                    whiteSpace: "normal",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        fontSize: "1rem",
                                        padding: theme.spacing(1, 2, 0.5, 2),
                                        order: 1,
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                        "&::before": {
                                            content: `'${commentMobileLabels[2]}: '`,
                                            ...labelStyles,
                                        }, // 제목
                                    },
                                })}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        flexGrow: 1,
                                        minWidth: 0,
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {item.postTitle}
                                    {item.commentNumber > 0 && (
                                        <Typography
                                            component="span"
                                            sx={{
                                                ml: 1,
                                                fontWeight: 600,
                                                color: RED_COLOR,
                                                fontSize: "0.8rem",
                                                flexShrink: 0,
                                            }}
                                        >
                                            [{item.commentNumber}]
                                        </Typography>
                                    )}
                                </Box>
                            </TableCell>
                            {/* 댓글 내용 - 20% */}
                            <TableCell
                                sx={(theme) => ({
                                    color: LIGHT_TEXT_COLOR,
                                    maxWidth: "250px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        fontSize: "0.85rem",
                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                        order: 3,
                                        "&::before": {
                                            content: `'${commentMobileLabels[3]}: '`,
                                            ...labelStyles,
                                        }, // 내용
                                    },
                                })}
                            >
                                <ForumIcon
                                    sx={{
                                        fontSize: "1rem",
                                        verticalAlign: "middle",
                                        color: TEXT_COLOR,
                                        mr: 0.5,
                                    }}
                                />
                                {item.content}
                            </TableCell>
                            {/* 작성자 - 15% */}
                            <TableCell
                                sx={(theme) => ({
                                    color: LIGHT_TEXT_COLOR,
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        fontSize: "0.85rem",
                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                        order: 4,
                                        "&::before": {
                                            content: `'${commentMobileLabels[4]}: '`,
                                            ...labelStyles,
                                        }, // 작성자
                                    },
                                })}
                            >
                                {item.username}
                            </TableCell>
                            {/* 좋아요 수 - 10% */}
                            <TableCell
                                sx={(theme) => ({
                                    color: item.savedInLikes ? PURPLE_COLOR : RED_COLOR,
                                    fontWeight: 600,
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        alignItems: "center",
                                        fontSize: "0.85rem",
                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                        order: 6, // 순서 조정
                                        color: LIGHT_TEXT_COLOR,
                                        fontWeight: 400,
                                        "&::before": {
                                            content: `'${commentMobileLabels[5]}: '`,
                                            ...labelStyles,
                                        }, // 좋아요
                                    },
                                })}
                            >
                                <FavoriteIcon
                                    sx={{
                                        fontSize: "1rem",
                                        verticalAlign: "middle",
                                        color: item.savedInLikes ? PURPLE_COLOR : RED_COLOR,
                                        mr: 0.5,
                                    }}
                                />
                                {item.likes || 0}
                            </TableCell>
                            {/* 작성일 - 10% */}
                            <TableCell
                                sx={(theme) => ({
                                    color: LIGHT_TEXT_COLOR,
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        fontSize: "0.85rem",
                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                        order: 5, // 순서 조정
                                        "&::before": {
                                            content: `'${commentMobileLabels[6]}: '`,
                                            ...labelStyles,
                                        }, // 작성일
                                    },
                                })}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        whiteSpace: "nowrap",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span>
                                        {dateDisplay}
                                        {isModified && (
                                            <Typography
                                                component="span"
                                                sx={{
                                                    ml: 0.5,
                                                    fontWeight: 600,
                                                    color: MODIFIED_COLOR,
                                                    fontSize: "0.7rem",
                                                    flexShrink: 0,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                [수정됨]
                                            </Typography>
                                        )}
                                    </span>
                                    {/* [NEW] Accordion Icon */}
                                    <IconButton
                                        size="small"
                                        sx={{
                                            ml: 1,
                                            p: 0,
                                            color: TEXT_COLOR,
                                            transform: isExpanded ? "rotate(360deg)" : "rotate(0deg)",
                                            transition: "transform .3s",
                                            "&:hover": { backgroundColor: "transparent" },
                                        }}
                                    >
                                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell
                                colSpan={currentColSpan}
                                sx={{
                                    display: { xs: "block", md: "table-cell" },
                                    p: 0,
                                    borderBottom: isExpanded
                                        ? `1px solid ${TEXT_COLOR} !important`
                                        : "none !important",
                                }}
                            >
                                <Collapse in={isExpanded} timeout={300} unmountOnExit>
                                    {collapseItem(item)}
                                </Collapse>
                            </TableCell>
                        </TableRow>
                    </React.Fragment>
                );
            } else {
                return (
                    <React.Fragment key={item.id}>
                        <TableRow
                            sx={rowSx}
                            aria-label={`회원명 ID ${item.id}`}
                            onClick={(event) => handleRowClick(item, event)}
                        >
                            {/* ID (댓글 ID) - 5% */}
                            <TableCell
                                component="th"
                                scope="row"
                                sx={(theme) => ({
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "0.8rem",
                                        color: LIGHT_TEXT_COLOR,
                                        padding: theme.spacing(0, 2, 0.5, 2),
                                        order: 7,
                                        "&::before": {
                                            content: `'${userMobileLabels[0]}: '`,
                                            ...labelStyles,
                                        },
                                    },
                                })}
                            >
                                {item.id}
                            </TableCell>
                            {/* 제목 (게시글 제목) - 32% */}
                            <TableCell
                                sx={(theme) => ({
                                    fontWeight: 600,
                                    color: TEXT_COLOR,
                                    maxWidth: "200px",
                                    whiteSpace: "normal",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        fontSize: "1rem",
                                        padding: theme.spacing(1, 2, 0.5, 2),
                                        order: 1,
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                        "&::before": {
                                            content: `'${userMobileLabels[1]}: '`,
                                            ...labelStyles,
                                        },
                                    },
                                })}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        flexGrow: 1,
                                        minWidth: 0,
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {item.username}
                                </Box>
                            </TableCell>
                            {/* 댓글 내용 - 20% */}
                            <TableCell
                                sx={(theme) => ({
                                    color: LIGHT_TEXT_COLOR,
                                    maxWidth: "250px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        fontSize: "0.85rem",
                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                        order: 3,
                                        "&::before": {
                                            content: `'${userMobileLabels[2]}: '`,
                                            ...labelStyles,
                                        },
                                    },
                                })}
                            >
                                {item.email}
                            </TableCell>
                            {/* 작성일 - 10% */}
                            <TableCell
                                sx={(theme) => ({
                                    color: LIGHT_TEXT_COLOR,
                                    [theme.breakpoints.down("sm")]: {
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        fontSize: "0.85rem",
                                        padding: theme.spacing(0.5, 2, 0.5, 2),
                                        order: 5, // 순서 조정
                                        "&::before": {
                                            content: `'${userMobileLabels[3]}: '`,
                                            ...labelStyles,
                                        },
                                    },
                                })}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        whiteSpace: "nowrap",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span>{formatTimeOrDate(item.createdDate)}</span>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            ml: 1,
                                            p: 0,
                                            color: TEXT_COLOR,
                                            transform: isExpanded ? "rotate(360deg)" : "rotate(0deg)",
                                            transition: "transform 0.3s",
                                            "&:hover": { backgroundColor: "transparent" },
                                        }}
                                    >
                                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell
                                colSpan={currentColSpan}
                                sx={{
                                    display: { xs: "block", md: "table-cell" },
                                    p: 0,
                                    borderBottom: isExpanded
                                        ? `1px solid ${TEXT_COLOR} !important`
                                        : "none !important",
                                }}
                            >
                                <Collapse in={isExpanded} timeout={300} unmountOnExit>
                                    {collapseItem(item)}
                                </Collapse>
                            </TableCell>
                        </TableRow>
                    </React.Fragment>
                );
            }
        });
    };

    // 4. 게시글 주제 탭 렌더링
    const renderSubjectTabs = () => {
        if (activityType !== 2) {
            return (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: { xs: "flex-start", md: "flex-start" },
                        overflowX: { xs: "hidden", md: "visible" },
                        borderBottom: `1px solid ${alpha(TEXT_COLOR, 0.2)}`,
                    }}
                >
                    <Tabs
                        value={selectedTab}
                        onChange={handleSubjectTabChange}
                        aria-label="게시글 주제 탭"
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            width: { xs: "100%", md: "auto" },
                            "& .MuiTabs-indicator": { backgroundColor: TEXT_COLOR },
                            overflowX: "hidden",
                            "&::-webkit-scrollbar": { display: "none" },
                        }}
                    >
                        <CustomTab label="전체" value={0} />
                        <CustomTab label="질문" value={1} />
                        <CustomTab label="공유" value={2} />
                        <CustomTab label="모집" value={3} />
                    </Tabs>
                </Box>
            );
        }
        return null;
    };

    return (
        <PostsListWrapper>
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    align="left"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        mb: 4,
                        color: TEXT_COLOR,
                        fontSize: { xs: "2rem", md: "2.5rem" },
                        textAlign: { xs: "center", md: "left" },
                    }}
                >
                    {activityType === 0
                        ? "신고된 게시글"
                        : activityType === 1
                            ? "신고된 댓글"
                            : "전체 회원 관리"}
                </Typography>
                <PostsCard elevation={0}>
                    {/* 상위: 게시글/댓글 관리 전환 탭 */}
                    <Box
                        sx={{ mb: 3, borderBottom: `1px solid ${alpha(TEXT_COLOR, 0.2)}` }}
                    >
                        <Tabs
                            value={activityType}
                            onChange={handleActivityTypeChange}
                            aria-label="관리 유형 탭"
                            sx={{
                                "& .MuiTabs-indicator": {
                                    backgroundColor: TEXT_COLOR,
                                    height: "2px",
                                },
                            }}
                        >
                            <Tab
                                label="게시글"
                                value={0}
                                sx={{
                                    fontWeight: 700,
                                    color: TEXT_COLOR,
                                    width: { xs: "33.333% !important", md: "auto !important" },
                                }}
                            />
                            <Tab
                                label="댓글"
                                value={1}
                                sx={{
                                    fontWeight: 700,
                                    color: TEXT_COLOR,
                                    width: { xs: "33.333% !important", md: "auto !important" },
                                }}
                            />
                            <Tab
                                label="사용자"
                                value={2}
                                sx={{
                                    fontWeight: 700,
                                    color: TEXT_COLOR,
                                    width: { xs: "33.333% !important", md: "auto !important" },
                                }}
                            />
                        </Tabs>
                    </Box>

                    {/* 중위: 게시글 주제 탭 (게시글/댓글 모드 모두 표시) */}
                    <Box sx={{ mb: 3 }}>{renderSubjectTabs()}</Box>

                    {/* 하위: 검색, 정렬 및 목록 표시 영역 */}
                    <Box
                        sx={(theme) => ({
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            [theme.breakpoints.down("sm")]: {
                                padding: theme.spacing(0, 2),
                            },
                        })}
                    >
                        {/* 정렬, 검색 버튼 영역 */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: { xs: "column", md: "row" },
                                gap: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    width: { xs: "100%", md: "auto" },
                                    flexDirection: { xs: "column", md: "row" },
                                    justifyContent: { xs: "flex-start", md: "flex-start" },
                                    alignItems: { xs: "flex-start", md: "center" },
                                }}
                            >
                                {/* 정렬 및 검색 필터 버튼 그룹 */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        width: { xs: "100%", md: "auto" },
                                        justifyContent: "flex-start",
                                    }}
                                >
                                    {/* 정렬 버튼 */}
                                    <FilterButton
                                        variant="outlined"
                                        endIcon={
                                            sortOrder === "desc" ? (
                                                <ArrowDownwardIcon />
                                            ) : (
                                                <ArrowUpwardIcon />
                                            )
                                        }
                                        onClick={handleSortClick}
                                        aria-controls={openSortMenu ? "sort-menu" : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={openSortMenu ? "true" : undefined}
                                        sx={{ flex: { xs: 1, md: "none" } }}
                                    >
                                        {sortOrder === "desc" ? "최신순" : "오래된순"}
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
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem onClick={() => handleSortOptionSelect("desc")}>
                                            내림차순 (최신순)
                                        </MenuItem>
                                        <MenuItem onClick={() => handleSortOptionSelect("asc")}>
                                            오름차순 (오래된순)
                                        </MenuItem>
                                    </Menu>

                                    {/* 검색 필드 선택 버튼 */}
                                    <FilterButton
                                        variant="outlined"
                                        endIcon={<SortIcon />}
                                        onClick={handleFilterClick}
                                        aria-controls={openFilterMenu ? "filter-menu" : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={openFilterMenu ? "true" : undefined}
                                        sx={{ flex: { xs: 1, md: "none" } }}
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
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                },
                                            },
                                        }}
                                    >
                                        {filterMenuItems}
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
                                        if (e.key === "Enter") {
                                            handleSearchSubmit();
                                        }
                                    }}
                                    sx={{
                                        minWidth: { xs: "100%", md: "200px" },
                                        flexGrow: 1,
                                        mt: { xs: 1, md: 0 },
                                    }}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
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
                                        },
                                    }}
                                />
                                {/* 몇 개씩 보여줄지 선택 메뉴 */}
                                <FilterButton
                                    variant="outlined"
                                    onClick={handlePerPageClick}
                                    sx={{ width: { xs: "100%", md: "100px" } }}
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
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
                        </Box>
                    </Box>

                    {/* 게시글/댓글 테이블 */}
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={(theme) => ({
                            border: `1px solid ${TEXT_COLOR}`,
                            marginTop: theme.spacing(3),
                            [theme.breakpoints.down("sm")]: {
                                marginX: theme.spacing(2),
                                width: `calc(100% - ${theme.spacing(4)})`,
                            },
                        })}
                    >
                        <Table aria-label="관리 목록">
                            <TableHead>{tableHeaders}</TableHead>
                            <TableBody>{renderTableBody()}</TableBody>
                        </Table>
                    </TableContainer>

                    {/* 페이지네이션 컴포넌트 */}
                    {pageCount > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                            <Pagination
                                count={pageCount}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                sx={{
                                    "& .MuiPaginationItem-root.Mui-selected": {
                                        backgroundColor: TEXT_COLOR,
                                        color: BG_COLOR,
                                        "&:hover": { backgroundColor: LIGHT_TEXT_COLOR },
                                    },
                                    "& .MuiPaginationItem-root": { color: TEXT_COLOR },
                                }}
                            />
                        </Box>
                    )}
                </PostsCard>
            </Container>
        </PostsListWrapper>
    );
};

export default AdminPage;
