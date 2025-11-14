// src/components/ChatList.js (PostsList.js의 UI/기능을 반영)

import React, { useState, useEffect } from "react";
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
  Pagination,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import apiClient from "../../api/Api-Service";
import {
  BG_COLOR,
  TEXT_COLOR,
  LIGHT_TEXT_COLOR,
  VIEW_SAVED_COLOR,
  NEW_COLOR,
  HEADER_HEIGHT,
} from "../constants/Theme";

// 스타일 컴포넌트 정의 (PostsList.js와 동일)
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
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2, 0) },
}));

const CustomTab = styled(Tab)(({ theme }) => ({
  color: TEXT_COLOR,
  fontWeight: 600,
  flexShrink: 1,
  minWidth: "80px",
  padding: "12px 16px",
  [theme.breakpoints.down("sm")]: { minWidth: "25%", padding: 0 },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  color: BG_COLOR,
  backgroundColor: TEXT_COLOR,
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  "&:hover": { backgroundColor: LIGHT_TEXT_COLOR },
}));

const CustomSearchField = styled(TextField)(({ theme }) => ({
  minWidth: 150,
  color: `${LIGHT_TEXT_COLOR} !important`,
  "& .MuiInputLabel-root": { color: LIGHT_TEXT_COLOR },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: TEXT_COLOR },
    "&:hover fieldset": { borderColor: TEXT_COLOR },
    "&.Mui-focused fieldset": { borderColor: TEXT_COLOR, borderWidth: "1px" },
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
  [theme.breakpoints.down("sm")]: { display: "none" },
}));

// PostsList.js와 달리 커뮤니티 목록에 불필요한 StyledChip은 제거

const ChatList = () => {
  const navigate = useNavigate();
  // useLocation은 필요하나, isMyPostsMode 로직은 ChatList 컨텍스트에 맞지 않아 제거
  const location = useLocation();

  // API 연동 및 데이터 관련 상태
  const [posts, setPosts] = useState([]); // 게시글 대신 채팅방 목록 저장
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPosts, setTotalPosts] = useState(0);

  // 필터링, 정렬, 페이지네이션 상태
  const [selectedTab, setSelectedTab] = useState(0); // 0: 전체, 1: 커뮤니티, 2: 관리자, 3: 참가자
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // ID 기준 내림차순/오름차순 정렬 유지
  const [searchField, setSearchField] = useState("커뮤니티"); // 기본 검색 필드를 '커뮤니티'로 변경
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 메뉴 Anchor 상태
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const openSortMenu = Boolean(sortAnchorEl);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const openFilterMenu = Boolean(filterAnchorEl);
  const [perPageAnchorEl, setPerPageAnchorEl] = useState(null);
  const openPerPageMenu = Boolean(perPageAnchorEl);

  /**
   * 채팅방 목록 API 호출 로직 (PostsList.js 로직 반영)
   */
  useEffect(() => {
    const fetchPosts = async (currentPage, currentTab, currentSortOrder, currentRowsPerPage, currentSearchField, currentSearchTerm) => {
      setIsLoading(true);
      setError(null);

      const pageNumberForBackend = currentPage - 1;
      const sortParam = `id,${currentSortOrder}`; // ID 기준 정렬 유지
      const searchFieldParam = `searchField=${currentSearchField}`;
      const searchTermParam = `searchTerm=${currentSearchTerm}`;
      // 탭 필터링: selectedTab에 따라 다른 엔드포인트나 쿼리 파라미터 사용 가정
      // 여기서는 탭 상태를 쿼리 파라미터로 전달하도록 수정합니다. (PostsList 로직 유지)
      const tabParam = currentTab > 0 ? `&tab=${currentTab}` : '';

      // API 엔드포인트를 커뮤니티 목록 경로인 '/chats'로 가정합니다.
      const baseUrl = '/chats'; 

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
        const errorMsg = error.response?.data?.message || "커뮤니티 목록을 불러오는 중 오류가 발생했습니다.";
        console.error("커뮤니티 목록 로드 오류:", errorMsg);
        setError(errorMsg);
        setPosts([]);
        setTotalPosts(0);
      } finally {
        setIsLoading(false);
      }
    };

    // 상태가 변경될 때마다 API 호출
    // fetchPosts(page, selectedTab, sortOrder, rowsPerPage, searchField, searchTerm);

  }, [page, selectedTab, sortOrder, searchField, searchTerm, rowsPerPage]);

  // 이벤트 핸들러 (PostsList.js와 유사하게 유지)
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

  // TableRow 클릭 핸들러: 채팅방 상세 페이지로 이동 가정
  const handleRowClick = (chatRoomId) => {
    // 채팅방 상세 페이지 경로를 '/chat/{id}'로 가정합니다.
    navigate(`/chat/${chatRoomId}`);
  };

  // 전체 게시글 수와 페이지당 행 수를 기반으로 페이지 수 계산
  const pageCount = Math.ceil(totalPosts / rowsPerPage);

  // 모바일 뷰에서 사용할 레이블 및 스타일
  const mobileLabels = ['ID', '커뮤니티', '관리자', '인원', '접속중'];
  const labelStyles = { fontWeight: 'bold', color: TEXT_COLOR, minWidth: '60px', marginRight: '8px' };
  
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
          커뮤니티 목록
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
                    aria-label="채팅방 필터 탭"
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
                    <CustomTab label="커뮤니티" value={1} />
                    <CustomTab label="관리자" value={2} />
                    <CustomTab label="참가자" value={3} />
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
                    {/* 정렬 기준은 ID 기준 내림/오름차순 유지 */}
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
                    <MenuItem onClick={() => handleSortOptionSelect('desc')}>내림차순 (최신순)</MenuItem>
                    <MenuItem onClick={() => handleSortOptionSelect('asc')}>오름차순 (오래된순)</MenuItem>
                    {/* 추가 정렬 옵션: 관리자, 인원 등 */}
                    {/* <MenuItem onClick={() => handleSortOptionSelect('admin')}>관리자</MenuItem> */}
                    {/* <MenuItem onClick={() => handleSortOptionSelect('memberCount')}>인원</MenuItem> */}
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
                    {/* 커뮤니티 목록에 맞는 검색 필드: 관리자(채팅방 이름), 관리자 */}
                    <MenuItem onClick={() => handleFilterOptionSelect('커뮤니티')}>커뮤니티</MenuItem>
                    <MenuItem onClick={() => handleFilterOptionSelect('관리자')}>관리자</MenuItem>
                    <MenuItem onClick={() => handleFilterOptionSelect('참가자')}>참가자</MenuItem>
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
                    InputProps={{ // InputProps로 변경
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
                    }}
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
            </Box>
          </Box>

          {/* 커뮤니티 목록 테이블 */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={(theme) => ({
              border: `1px solid ${TEXT_COLOR}`,
              [theme.breakpoints.down("sm")]: {
                marginX: theme.spacing(2),
                width: `calc(100% - ${theme.spacing(4)})`,
              },
            })}
          >
            <Table aria-label="커뮤니티 목록">
              <TableHead>
                <TableRow>
                  <CustomTableCell sx={{ width: "10%" }}>ID</CustomTableCell>
                  <CustomTableCell sx={{ width: "50%" }}>
                    커뮤니티
                  </CustomTableCell>
                  <CustomTableCell sx={{ width: "15%" }}>
                    관리자
                  </CustomTableCell>
                  <CustomTableCell sx={{ width: "10%" }}>인원</CustomTableCell>
                  <CustomTableCell sx={{ width: "15%" }}>
                    접속중
                  </CustomTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 5 }}>
                      <CircularProgress sx={{ color: TEXT_COLOR }} size={30} />
                      <Typography
                        variant="body1"
                        sx={{ mt: 1, color: LIGHT_TEXT_COLOR }}
                      >
                        목록을 불러오는 중...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 5 }}>
                      <Typography variant="body1" color="error">
                        {error}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 5 }}>
                      <Typography
                        variant="body1"
                        sx={{ color: LIGHT_TEXT_COLOR }}
                      >
                        {searchTerm
                          ? `"${searchTerm}"에 대한 검색 결과가 없습니다.`
                          : "커뮤니티 목록이 없습니다."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => {
                    // ChatList.js의 원래 매핑 로직 유지 (속성명은 PostsList.js와 동일하게 가정)
                    const viewColor = post.savedInViews
                      ? VIEW_SAVED_COLOR
                      : LIGHT_TEXT_COLOR;
                    const communityName = post.title; // 채팅방 이름을 title로 사용
                    const admin = post.username; // 관리자를 username으로 사용
                    const memberCount = post.likes || 0; // 인원을 likes로 사용 가정
                    const onlineCount = post.viewCount || 0; // 접속 중 인원을 viewCount로 사용 가정

                    return (
                      <TableRow
                        key={post.id}
                        onClick={() => handleRowClick(post.id)}
                        sx={(theme) => ({
                          "& > .MuiTableCell-root": {
                            borderBottom: `1px solid ${alpha(
                              LIGHT_TEXT_COLOR,
                              0.4
                            )}`,
                          },
                          "&:last-child > .MuiTableCell-root": {
                            borderBottom: "none",
                          },
                          // PostsList.js의 새 글 표시 로직을 채팅방 입장 여부로 사용
                          backgroundColor: post.savedInViews
                            ? BG_COLOR
                            : alpha(NEW_COLOR, 0.1),
                          "&:hover": {
                            backgroundColor: alpha(TEXT_COLOR, 0.05),
                            cursor: "pointer",
                          },
                          // 모바일 뷰 스타일 반영 (PostsList.js와 유사하게)
                          [theme.breakpoints.down("sm")]: {
                            display: "block",
                            borderBottom: `1px solid ${TEXT_COLOR} !important`,
                            padding: theme.spacing(1, 0),
                            "& > .MuiTableCell-root": {
                              borderBottom: "none !important",
                            },
                          },
                        })}
                      >
                        {/* ID */}
                        <TableCell sx={(theme) => ({
                            color: LIGHT_TEXT_COLOR,
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.8rem',
                                padding: theme.spacing(0, 2, 0.5, 2),
                                order: 5,
                                '&::before': { content: `'${mobileLabels[0]}: '`, ...labelStyles }
                            }
                        })}>
                          {post.id}
                        </TableCell>
                        {/* 커뮤니티 (제목) */}
                        <TableCell sx={(theme) => ({
                            color: TEXT_COLOR, fontWeight: 600,
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                fontSize: '1rem',
                                padding: theme.spacing(1, 2, 0.5, 2),
                                order: 1,
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                '&::before': { content: `'${mobileLabels[1]}: '`, ...labelStyles } // 모바일 레이블 추가
                            }
                        })}>
                          {communityName}
                        </TableCell>
                        {/* 관리자 (작성자) */}
                        <TableCell sx={(theme) => ({
                            color: LIGHT_TEXT_COLOR,
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex',
                                justifyContent: 'flex-start',
                                fontSize: '0.85rem',
                                padding: theme.spacing(0.5, 2, 0.5, 2),
                                order: 2,
                                '&::before': { content: `'${mobileLabels[2]}: '`, ...labelStyles } // 모바일 레이블 추가
                            }
                        })}>
                          {admin}
                        </TableCell>
                        {/* 인원 (좋아요 수) */}
                        <TableCell sx={(theme) => ({
                            color: LIGHT_TEXT_COLOR,
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex',
                                justifyContent: 'flex-start',
                                fontSize: '0.85rem',
                                padding: theme.spacing(0.5, 2, 0.5, 2),
                                order: 3,
                                '&::before': { content: `'${mobileLabels[3]}: '`, ...labelStyles } // 모바일 레이블 추가
                            }
                        })}>
                          {memberCount}
                        </TableCell>
                        {/* 접속중 (조회수) */}
                        <TableCell sx={(theme) => ({
                            color: viewColor, fontWeight: 600,
                            [theme.breakpoints.down('sm')]: {
                                display: 'flex',
                                justifyContent: 'flex-start',
                                fontSize: '0.85rem',
                                padding: theme.spacing(0.5, 2, 0.5, 2),
                                order: 4,
                                '&::before': { content: `'${mobileLabels[4]}: '`, ...labelStyles } // 모바일 레이블 추가
                            }
                        })}>
                          {onlineCount}
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
                    }}메ㅑ
                />
            </Box>
          )}
        </PostsCard>
      </Container>
    </PostsListWrapper>
  );
};

export default ChatList;