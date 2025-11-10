// src/components/PostsDetail.js

import React, { useState, useEffect, useRef } from 'react'; // useRef 추가
import {
    Box, Container, Typography, Paper, Chip, Button, Divider,
    List, ListItem, ListItemText, TextField, IconButton,
    CircularProgress
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { 
    Link, useNavigate, useParams, 
    useLocation // 💡 추가됨: URL의 쿼리 파라미터를 사용하기 위해 useLocation 추가
} from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FlagIcon from '@mui/icons-material/Flag';
import { useAuth } from '../auth/AuthContext';
import apiClient from '../../api/Api-Service'; // API 서비스 추가
import { Favorite, FavoriteBorder, FavoriteBorderSharp } from '@mui/icons-material';

// 상수 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';
const HEADER_HEIGHT = '64px';
const RED_COLOR = '#f44336';
const PURPLE_COLOR = '#9c27b0';
const DARK_PURPLE_COLOR = '#6a1b9a'; // 보라색 호버/어두운 버전
// 💡 수정됨: 수정됨 표시 색상 (골든 옐로우)
const MODIFIED_COLOR = '#FFC107'; 

// 스타일 컴포넌트 정의 
const DetailWrapper = styled(Box)(({ theme }) => ({
    marginTop: HEADER_HEIGHT,
    backgroundColor: BG_COLOR,
    padding: theme.spacing(4, 0),
}));

const DetailCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: (theme.shape?.borderRadius || 4) * 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: `1px solid ${TEXT_COLOR}`,
    backgroundColor: BG_COLOR,
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2, 0),
    },
}));

// transient prop으로 colorName을 colorName으로 변경
const ActionButton = styled(Button, {shouldForwardProp: prop => prop !== 'colorName'})(({ theme, colorName }) => ({
    // 'delete' 일 때 배경색을 RED_COLOR로 변경
    backgroundColor: colorName === 'delete' ? RED_COLOR : BG_COLOR,
    // 'delete' 일 때 글자색을 대비가 좋은 흰색 계열로 변경 (TEXT_COLOR가 어두운 색일 경우)
    color: colorName === 'delete' ? '#fff' : TEXT_COLOR,
    // border 색상도 통일
    border: `1px solid ${colorName === 'delete' ? RED_COLOR : TEXT_COLOR}`,
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    minWidth: '100px',
    '&:hover': {
        // 자연스러운 효과를 위해 alpha 함수 사용 예시 (RED_COLOR가 HEX 코드일 경우)
        backgroundColor: colorName === 'delete' ? alpha(RED_COLOR, 0.9) : alpha(TEXT_COLOR, 0.05),
        borderColor: colorName === 'delete' ? alpha(RED_COLOR, 0.9) : LIGHT_TEXT_COLOR,
    },
}));

const StyledChip = styled(Chip)(({ theme, subject }) => {
    let chipColor;
    switch (subject) {
        case '질문':
            chipColor = '#FFC107';
            break;
        case '모집':
            chipColor = '#4CAF50';
            break;
        case '공유':
        default:
            chipColor = '#2196F3';
            break;
    }
    return {
        backgroundColor: chipColor,
        color: BG_COLOR,
        fontWeight: 600,
        fontSize: '0.85rem',
        height: '30px',
    };
});


// ------------------ 게시글 타입별 상세 정보 표시 컴포넌트 ------------------
const DetailItem = ({ label, value }) => {
    if (!value) return null;
    return (
        <Box sx={{ mb: 1.5, mr: 4, minWidth: '150px' }}>
            <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: TEXT_COLOR, display: 'block', mb: 0.5 }}
            >
                {label}
            </Typography>
            <Typography
                variant="body1"
                color={TEXT_COLOR}
                sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
            >
                {value}
            </Typography>
        </Box>
    );
};

const SubjectSpecificDetails = ({ post }) => {
    // post가 null인 경우 처리
    if (!post) return null;

    const commonSx = (theme) => ({
        mt: 3, mb: 4, p: 2,
        border: `1px dashed ${LIGHT_TEXT_COLOR}`,
        borderRadius: 1,
        backgroundColor: alpha(TEXT_COLOR, 0.02),
        [theme.breakpoints.down('sm')]: {
            marginX: theme.spacing(2),
        },
    });

    // 1. 질문 게시글 상세 정보
    if (post.subject === '질문' && (post.bookTitle || post.pageNumber)) {
        return (
            <Box sx={commonSx}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: TEXT_COLOR }}>
                    질문 상세 정보
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', '& > *': { minWidth: { xs: '100%', sm: '45%' } } }}>
                    <DetailItem label="참고 서적" value={post.bookTitle} />
                    <DetailItem label="페이지" value={post.pageNumber + 'p'} />
                </Box>
            </Box>
        );
    }

    // 2. 모집 게시글 상세 정보
    if (post.subject === '모집' && (post.region || post.meetingInfo)) {
        return (
            <Box sx={commonSx}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: TEXT_COLOR }}>
                    모집 상세 정보
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', '& > *': { minWidth: { xs: '100%', sm: '45%' } } }}>
                    <DetailItem label="모임 지역" value={post.region} />
                    <DetailItem label="모임 일정" value={post.meetingInfo} />
                </Box>
            </Box>
        );
    }

    return null; // 공유 게시글은 추가 상세 정보 없음
};


/**
 * 작성일 형식: MM/DD HH:MM 포맷으로 반환
 */
const formatFullDate = (dateString) => {
    if (!dateString) return '';
    const postDate = new Date(dateString);
    const month = String(postDate.getMonth() + 1).padStart(2, '0');
    const day = String(postDate.getDate()).padStart(2, '0');
    const hours = String(postDate.getHours()).padStart(2, '0');
    const minutes = String(postDate.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
};


/**
 * 수정됨: modifiedDate 비교 로직 함수 (게시글/댓글 모두 사용)
 * createdDate와 modifiedDate를 비교하여 표시할 날짜 문자열과 수정 여부를 반환합니다.
 * @param {string} modifiedDateString 수정 날짜 문자열
 * @param {string} createdDateString 생성 날짜 문자열
 * @returns {{ dateDisplay: string, isModified: boolean }} 표시할 날짜 정보와 수정 여부
 */
const getPostDateInfo = (modifiedDateString, createdDateString) => {
    // 날짜 문자열이 유효하지 않으면 빈 문자열과 false 반환
    if (!createdDateString) {
        return { dateDisplay: '', isModified: false };
    }

    const createdDate = new Date(createdDateString);
    const modifiedDate = modifiedDateString ? new Date(modifiedDateString) : createdDate; // modifiedDate가 없으면 createdDate 사용

    // modifiedDate가 createdDate보다 확실히 이후인 경우에만 수정된 것으로 간주 (1초 이상 차이)
    // API 응답 시간차를 고려하여 1000ms(1초) 이상 차이로 판단하는 것이 안전할 수 있습니다.
    const isModified = modifiedDateString && modifiedDate.getTime() > createdDate.getTime() + 1000;
    
    // 수정된 경우 modifiedDate를 사용하고, 아닌 경우 createdDate를 사용
    const dateToDisplay = isModified ? modifiedDateString : createdDateString;

    return {
        dateDisplay: formatFullDate(dateToDisplay),
        isModified: isModified,
    };
};


const PostsDetail = () => {
    const { id } = useParams();
    const location = useLocation(); // 💡 추가됨: location 객체 가져오기
    const { user } = useAuth();
    const navigate = useNavigate();

    // 💡 수정됨: 쿼리 파라미터에서 'from' 값 추출 및 경로 설정 로직 수정
    const queryParams = new URLSearchParams(location.search);
    const fromParam = queryParams.get('from');
    
    // fromParam 값에 따라 경로 설정: 'my-actives'면 /my/actives, 'my-favorite'면 /my/favorite, 아니면 /로 이동
    const backToPath = fromParam === 'my-actives' 
        ? '/my/actives' 
        : fromParam === 'my-favorite' ? '/my/favorite'
        : fromParam === 'my-alerts' ? '/my/alerts' : '/'
    

    // 댓글 리스트의 Ref 추가 (외부 클릭 감지용)
    const commentsListRef = useRef(null);

    // API 연동을 위한 상태 및 로딩 관리
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [postLikes, setPostLikes] = useState(0);
    // 좋아요 등록 여부 상태 (로그인하지 않은 사용자 기준 false)
    const [savedInPostLikes, setSavedInPostLikes] = useState(false)
    // 댓글 입력 상태 추가
    const [newCommentText, setNewCommentText] = useState('');
    const [comments, setComments] = useState([]);

    // 인라인 댓글 수정을 위한 상태
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');


    // 댓글 수정 취소 핸들러
    const handleCommentEditCancel = () => {
        setEditingCommentId(null);
        setEditingCommentContent('');
    };

    // 댓글 목록 외부 클릭 감지 핸들러
    const handleOutsideClick = (event) => {
        // 댓글 목록(List) 내부의 요소가 아닌 곳을 클릭했을 때 수정 취소
        if (editingCommentId && commentsListRef.current && !commentsListRef.current.contains(event.target)) {
            handleCommentEditCancel();
        }
    };

    // 댓글 수정 모드일 때 Esc 키 및 외부 클릭 이벤트 리스너 등록
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && editingCommentId) {
                handleCommentEditCancel();
            }
        };

        // 전역 이벤트 리스너 등록
        document.addEventListener('keydown', handleEscapeKey);
        document.addEventListener('mousedown', handleOutsideClick); // 마우스 클릭 감지

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [editingCommentId]); // editingCommentId가 변경될 때마다 재등록

    // API 호출 로직 (게시글 상세 정보 및 댓글 가져오기)
    useEffect(() => {
        const fetchPostDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 게시글 상세 API 호출 가정
                const postResponse = await apiClient.get(`/posts/${id}`);
                const postData = postResponse.data.result;

                if (postData) {
                    setPost(postData);
                    // API 응답에서 좋아요 수 및 좋아요 등록 여부, 댓글 목록을 초기화
                    setPostLikes(postData.likes || 0);
                    setSavedInPostLikes(postData.savedInLikes || false);
                    // postData.comments에는 isSavedInCommentLikes 필드가 포함되어 있다고 가정
                    setComments(postData.comments)
                } else {
                    setError("게시글 데이터를 찾을 수 없습니다.");
                    setPost(null);
                }

            } catch (err) {
                console.error("게시글 상세 로드 오류:", err.response?.data?.message || err.message);
                setError("게시글을 불러오는 중 오류가 발생했습니다.");
                setPost(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPostDetails();
    }, [id]); // id가 변경될 때마다 재요청

    // 게시글 좋아요 처리
    const handlePostLike = () => {
        const increaseLikeCount = async () => {
            try {
                const response = await apiClient.get(`/posts/${id}/handle-likes`)
                const isSavedInPostLikes = response.data.result.savedInLikes;

                // API 응답에 따라 상태 변경 (좋아요 등록/취소 여부)
                setSavedInPostLikes(isSavedInPostLikes)

                // 좋아요 수 업데이트
                if (isSavedInPostLikes) {
                    setPostLikes(postLikes + 1)
                } else {
                    setPostLikes(postLikes - 1)
                }
            } catch (err) {
                console.error("좋아요 증감 오류:", err.response?.data?.message || err.message);
                setError("좋아요 처리 중 오류가 발생했습니다.");
            }
        }
        increaseLikeCount();
    };

    // 댓글 좋아요 처리
    const handleCommentLike = async (commentId) => {
        try {
            const response = await apiClient.get(`/comment/${commentId}/handle-likes`)
            const isSavedInCommentLikes = response.data.result.savedInLikes

            // 좋아요 상태 및 좋아요 수를 동시에 업데이트
            setComments(prevComments => prevComments.map(comment => {
                const updatedComment = {
                    ...comment,
                    savedInLikes: isSavedInCommentLikes,
                    likes: isSavedInCommentLikes ? comment.likes + 1 : comment.likes - 1
                }
                return comment.id === commentId ? updatedComment : comment
            }))
        } catch (err) {
            console.error("좋아요 증감 오류:", err.response?.data?.message || err.message);
            setError("좋아요 처리 중 오류가 발생했습니다.");
        }
    };

    // 댓글 수정 모드 토글
    const handleCommentEditToggle = (commentId, content) => {
        if (editingCommentId === commentId) {
            handleCommentEditCancel(); // 이미 수정 모드였다면 취소
        } else {
            setEditingCommentId(commentId);
            setEditingCommentContent(content);
        }
    };

    // 댓글 수정 저장 (API 연동)
    const handleCommentEditSave = async (commentId) => {
        if (!editingCommentContent.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        try {
            const response = await apiClient.patch(`/comment/${commentId}`, {content: editingCommentContent})
            const { content: newContent, modifiedDate: newModifiedDate } = response.data.result; // 💡 수정: modifiedDate를 응답에서 가져옴
            
            if (newContent) {
                // UI 업데이트: content와 modifiedDate를 업데이트
                setComments(prevComments => prevComments.map(comment =>
                    comment.id === commentId ? { 
                        ...comment, 
                        content: newContent, 
                        modifiedDate: newModifiedDate // 💡 수정: modifiedDate 업데이트
                    } : comment
                ));
            }
        } catch(err) {
            console.error("댓글 수정 오류:", err.response?.data?.message || err.message);
            setError("댓글 수정 중 오류가 발생했습니다.");
        } finally {
            handleCommentEditCancel(); // 수정 모드 종료
        }
    };

    // 댓글 등록 핸들러
    const handleCommentSubmit = async () => {
        if (!newCommentText.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        const requestBody = {
            content: newCommentText
        }

        try {
            const response = await apiClient.post(`/comment/${id}`, requestBody)
            const commentData = response.data.result
            if (response.data.result) {
                const newComment = {
                    id: commentData.id,
                    content: commentData.content,
                    username: commentData.username,
                    // 💡 수정: API 응답에서 createdDate도 가져온다고 가정
                    createdDate: commentData.createdDate, 
                    modifiedDate: commentData.modifiedDate,
                    likes: commentData.likes,
                    // 새로 등록된 댓글은 기본적으로 savedInLikes는 false로 가정
                    savedInLikes: false 
                }
                setComments(prev => [newComment, ...prev]) // 새 댓글을 목록 맨 앞에 추가
                setNewCommentText('');
            }
        } catch (err) {
            console.error("댓글 생성 오류:", err.response?.data?.message || err.message);
            setError("댓글 생성 중 오류가 발생했습니다.");
        }

    };

    // 신고 핸들러
    const handleReport = (type, targetId) => {
        if (window.confirm(`${type} (${targetId})를 신고하시겠습니까? 신고 후에는 되돌릴 수 없습니다.`)) {
            // 실제 신고 API 호출 로직은 여기에 추가됩니다.
            alert(`${type} (${targetId})를 신고했습니다. 감사합니다.`);
        }
    };

    // 게시글 수정 페이지 이동
    const handleEdit = () => {
        navigate(`/post/edit/${id}`);
    };

    // 게시글 삭제
    const handleDelete = async () => {
        if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
            try {
                const postResponse = await apiClient.delete(`/posts/${id}`)
                if (postResponse.data.result.id) {
                } else {
                    setError(`${id}번 게시글을 삭제하는데 실패했습니다.`)
                }
                // 💡 수정됨: backToPath로 이동
                navigate(backToPath) 
            } catch (err) {
                alert('에러 발생:' + err.response.data.message || '예상하지 못한 에러.')
            }
        }
    };

    // 댓글 삭제 (API 연동)
    const handleCommentDelete = async (commentId) => {
        if (window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
            try {
                const postResponse = await apiClient.delete(`/comment/${commentId}`)
                if (postResponse.data.result.id) {
                    setComments(comments => comments.filter(comment => comment.id !== commentId))
                } else {
                    setError(`${id}번 댓글을 삭제하는데 실패했습니다.`)
                }
            } catch (err) {
                alert('에러 발생:' + err.response.data.message || '예상하지 못한 에러.')
            }
        }
    }

    // 재사용 가능한 수정/삭제 버튼 그룹 정의
    const EditDeleteButtons = (
        <>
            <ActionButton
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
            >
                수정
            </ActionButton>
            <ActionButton
                variant="contained"
                // colorName 사용 (Transient Prop)
                colorName="delete"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
            >
                삭제
            </ActionButton>
        </>
    );

    // 로딩 및 에러 상태 처리
    if (isLoading) {
        // DetailWrapper 내부 Box에 모바일 padding 반영
        return (
            <DetailWrapper>
                <Container maxWidth="lg">
                    <Box sx={(theme) => ({
                        textAlign: 'center',
                        py: 10,
                        [theme.breakpoints.down('sm')]: {
                            paddingX: theme.spacing(2),
                        },
                    })}>
                        <CircularProgress sx={{ color: TEXT_COLOR }} size={40} />
                        <Typography variant="h6" sx={{ mt: 2, color: LIGHT_TEXT_COLOR }}>게시글을 불러오는 중입니다...</Typography>
                    </Box>
                </Container>
            </DetailWrapper>
        );
    }

    if (error || !post) {
        // DetailWrapper 내부 Box에 모바일 padding 반영
        return (
            <DetailWrapper>
                <Container maxWidth="lg">
                    <Box sx={(theme) => ({
                        [theme.breakpoints.down('sm')]: {
                            paddingX: theme.spacing(2),
                        },
                    })}>
                        <Typography variant="h5" align="center" color="error" sx={{ mt: 5 }}>
                            {error || "게시글을 찾을 수 없습니다."}
                        </Typography>
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            {/* 💡 수정됨: backToPath 변수를 사용하여 이동 경로 설정 */}
                            <Button component={Link} to={backToPath} startIcon={<ArrowBackIcon />}>목록으로</Button>
                        </Box>
                    </Box>
                </Container>
            </DetailWrapper>
        );
    }

    // 💡 추가됨: 게시글 날짜 정보 가져오기 (post가 로드된 후에 실행)
    const postDateInfo = getPostDateInfo(post.modifiedDate, post.createdDate);

    // post 객체가 있을 때만 렌더링
    return (
        <DetailWrapper>
            {/* 목록으로 버튼과 수정/삭제 버튼을 DetailCard 상단에 나란히 배치 */}
            <Container maxWidth="lg">
                <Box sx={(theme) => ({
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between', // 목록 <-> 수정/삭제 버튼을 양 끝에 정렬
                    alignItems: 'center',
                    paddingLeft: '0px !important',
                    // 모바일에서는 좌우 패딩 적용
                    [theme.breakpoints.down('sm')]: {
                        paddingX: theme.spacing(2),
                    },
                })}>
                    {/* 목록으로 버튼 */}
                    <Button
                        component={Link}
                        // 💡 수정됨: backToPath 변수를 사용하여 이동 경로 설정
                        to={backToPath} 
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: TEXT_COLOR, '&:hover': { backgroundColor: alpha(TEXT_COLOR, 0.05) } }}
                    >
                        목록으로
                    </Button>

                    {/* 수정/삭제 버튼 (모바일 화면에서만 표시) */}
                    {user?.username === post.username &&
                        <Box sx={(theme) => ({
                            display: { xs: 'flex', md: 'none' }, // SM 이하에서만 표시
                            gap: 1,
                            flexShrink: 0,
                            // 모바일에서 버튼 크기 조정으로 반응성 확보
                            '& > *': {
                                minWidth: 'auto',
                                padding: theme.spacing(0.5, 1),
                                fontSize: '0.75rem'
                            }
                        })}>
                            {EditDeleteButtons}
                        </Box>
                    }
                </Box>

                <DetailCard elevation={0}>
                    {/* DetailCard 내부 Box에 모바일 padding 추가 */}
                    <Box sx={(theme) => ({
                        mb: 3,
                        [theme.breakpoints.down('sm')]: {
                            paddingX: theme.spacing(2),
                        },
                    })}>
                        <StyledChip label={post.subject} subject={post.subject} sx={{ mb: 1.5 }} />
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{ fontWeight: 700, color: TEXT_COLOR, wordBreak: 'break-word' }}
                        >
                            {post.title}
                        </Typography>

                        <Divider sx={{ my: 2, borderColor: TEXT_COLOR }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: LIGHT_TEXT_COLOR }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                작성자: {post.username}
                            </Typography>
                            {/* 💡 수정됨: 게시글 날짜 표시 로직 */}
                            <Typography variant="body2">
                                작성일:
                                <Box component="span" sx={{ ml: 0.5, whiteSpace: 'nowrap' }}>
                                    {postDateInfo.dateDisplay}
                                    {postDateInfo.isModified && (
                                        <Typography
                                            component="span"
                                            sx={{
                                                ml: 0.5,
                                                fontWeight: 600,
                                                color: MODIFIED_COLOR,
                                                fontSize: '0.8rem', // 작은 글씨
                                                flexShrink: 0,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            [수정됨]
                                        </Typography>
                                    )}
                                </Box>
                            </Typography>
                        </Box>
                    </Box>

                    {/* 조건부 상세 정보 표시 (내부에서 모바일 패딩 처리됨) */}
                    <SubjectSpecificDetails post={post} />

                    {/* HTML 렌더링을 위한 dangerouslySetInnerHTML */}
                    {/* Box에 모바일 padding 추가 */}
                    <Box sx={(theme) => ({
                        p: 3,
                        minHeight: '200px',
                        border: `1px solid ${LIGHT_TEXT_COLOR}`,
                        borderRadius: 1,
                        mb: 4,
                        '& p': { margin: '0 0 1em 0' },
                        '& strong': { fontWeight: 700 },
                        [theme.breakpoints.down('sm')]: {
                            paddingX: theme.spacing(2),
                            marginX: theme.spacing(2),
                        },
                    })}>
                        <div
                            dangerouslySetInnerHTML={{ __html: post.content }}
                            style={{ color: TEXT_COLOR, wordBreak: 'break-word' }}
                        />
                    </Box>
                    {/* HTML 렌더링 수정 끝 */}

                    {/* 게시글 본문과 댓글란 사이의 좋아요/신고 버튼 */}
                    {/* Box에 모바일 padding 추가 */}
                    <Box sx={(theme) => ({
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        mb: 5,
                        [theme.breakpoints.down('sm')]: {
                            paddingX: theme.spacing(2),
                        },
                    })}>
                        <ActionButton
                            variant="contained"
                            startIcon={<Favorite />}
                            onClick={handlePostLike}
                            // savedInPostLikes 값에 따라 버튼 스타일 동적 변경
                            sx={{
                                color: savedInPostLikes ? BG_COLOR : BG_COLOR,
                                backgroundColor: savedInPostLikes ? PURPLE_COLOR : TEXT_COLOR,
                                '&:hover': {
                                    backgroundColor: savedInPostLikes ? DARK_PURPLE_COLOR : LIGHT_TEXT_COLOR
                                },
                                // 테두리 색상도 변경된 배경색에 맞게 조정 (좋아요 상태일 때는 테두리 제거)
                                border: '1px solid transparent',
                            }}
                        >
                            좋아요 ({postLikes})
                        </ActionButton>
                        <ActionButton
                            variant="outlined"
                            startIcon={<FlagIcon />}
                            onClick={() => handleReport('게시글', id)}
                        >
                            신고
                        </ActionButton>
                    </Box>

                    {/* 수정/삭제 버튼 위치 (md 이상에서만 표시) */}
                    {/* 기존 수정/삭제 버튼 (작성자에게만 표시) */}
                    {user?.username === post.username &&
                        <Box sx={(theme) => ({
                            display: { xs: 'none', md: 'flex' }, // MD 이상에서만 표시
                            justifyContent: 'flex-end',
                            gap: 1.5,
                            mb: 5,
                            [theme.breakpoints.down('sm')]: {
                                paddingX: theme.spacing(2),
                            },
                        })}>
                            {EditDeleteButtons}
                        </Box>
                    }

                    {/* Box에 모바일 padding 추가 */}
                    <Box sx={(theme) => ({
                        [theme.breakpoints.down('sm')]: {
                            paddingX: theme.spacing(2),
                        },
                    })}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_COLOR, mb: 2 }}>
                            댓글 ({comments.length})
                        </Typography>
                    </Box>


                    {/* 댓글 입력 영역 */}
                    {/* Box에 모바일 padding 추가 */}
                    <Box sx={(theme) => ({
                        mb: 3,
                        [theme.breakpoints.down('sm')]: {
                            paddingX: theme.spacing(2),
                        },
                    })}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="댓글을 입력하세요..."
                            variant="outlined"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: TEXT_COLOR },
                                    '&:hover fieldset': { borderColor: TEXT_COLOR },
                                    '&.Mui-focused fieldset': { borderColor: TEXT_COLOR, borderWidth: '1px' },
                                },
                                mb: 1
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <ActionButton
                                variant="contained"
                                onClick={handleCommentSubmit} // 댓글 등록 핸들러 연결
                            >
                                등록
                            </ActionButton>
                        </Box>
                    </Box>

                    {/* 댓글 목록 */}
                    {/* List에 Ref 및 모바일 margin/padding 추가 */}
                    <List
                        ref={commentsListRef}
                        sx={(theme) => ({
                            border: `1px solid ${LIGHT_TEXT_COLOR}`,
                            borderRadius: 1,
                            p: 0,
                            [theme.breakpoints.down('sm')]: {
                                marginX: theme.spacing(2), // 좌우 마진 추가
                            },
                        })}>
                        {comments
                            .filter(comment => comment) // null/undefined 항목을 필터링하여 'id' 접근 오류 방지
                            .map((comment, index, arr) => {
                                // 💡 추가: 댓글 날짜 정보 가져오기
                                const commentDateInfo = getPostDateInfo(comment.modifiedDate, comment.createdDate);
                                return (
                                <ListItem
                                    key={comment.id}
                                    disableGutters
                                    sx={{
                                        borderBottom: index !== arr.length - 1 ? `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` : 'none',
                                        py: 1.5,
                                        px: 2,
                                        flexDirection: 'column',
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, width: '100%' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: TEXT_COLOR }}>{comment.username}</Typography>
                                                {/* 💡 수정됨: 댓글 날짜 표시 로직에 수정됨 표시 추가 */}
                                                <Typography variant="caption" color={LIGHT_TEXT_COLOR}>
                                                    작성일:
                                                    <Box component="span" sx={{ ml: 0.5, whiteSpace: 'nowrap' }}>
                                                        {commentDateInfo.dateDisplay}
                                                        {commentDateInfo.isModified && (
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    ml: 0.5,
                                                                    fontWeight: 600,
                                                                    color: MODIFIED_COLOR,
                                                                    fontSize: '0.8rem',
                                                                    flexShrink: 0,
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                [수정됨]
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            // ListItemText의 secondary prop 내부의 최상위 요소를 Box (div)로 사용
                                            <Box sx={{ width: '100%' }}>
                                                {/* 인라인 수정 모드에 따른 텍스트/입력창 전환 */}
                                                {editingCommentId === comment.id ? (
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        value={editingCommentContent}
                                                        onChange={(e) => setEditingCommentContent(e.target.value)}
                                                        // 클릭 감지를 위해 id 추가
                                                        id={`comment-edit-${comment.id}`}
                                                        sx={{ mb: 1 }}
                                                    />
                                                ) : (
                                                    <Typography
                                                        variant="body2"
                                                        color={TEXT_COLOR}
                                                        sx={{ mb: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                                                    >
                                                        {comment.content}
                                                    </Typography>
                                                )}

                                                {/* 댓글 좋아요/신고/수정/삭제 버튼 및 좋아요 수 표시 */}
                                                <Box
                                                    sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center', mt: 1 }}
                                                >
                                                    {/* 전체 사용자 대상 액션 그룹 (좋아요, 신고) */}
                                                    <Box
                                                        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                                                    >
                                                        {/* 좋아요 버튼 (게시글 좋아요 버튼 디자인 참고) */}
                                                        <Button
                                                            size="small"
                                                            onClick={() => handleCommentLike(comment.id)}
                                                            disabled={editingCommentId === comment.id} // 수정 중에는 비활성화
                                                            startIcon={<Favorite fontSize="small" />}
                                                            sx={{
                                                                color: BG_COLOR,
                                                                '&.Mui-disabled': {
                                                                    color: comment.savedInLikes ? '#ecc8f3 !important' : `${LIGHT_TEXT_COLOR} !important`
                                                                },
                                                                backgroundColor: comment.savedInLikes ? PURPLE_COLOR : TEXT_COLOR,
                                                                '&:hover': {
                                                                    backgroundColor: comment.savedInLikes ? DARK_PURPLE_COLOR : LIGHT_TEXT_COLOR
                                                                },
                                                                border: '1px solid transparent',
                                                                fontWeight: 600,
                                                                minWidth: 'auto',
                                                                padding: '4px 8px',
                                                                height: '32px',
                                                                fontSize: '0.8rem',
                                                            }}
                                                        >
                                                            {/* 좋아요 수 표시 */}
                                                            ({comment.likes})
                                                        </Button>

                                                        {/* 신고 버튼 */}
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleReport('댓글', comment.id)}
                                                            disabled={editingCommentId === comment.id}
                                                            sx={{
                                                                color: LIGHT_TEXT_COLOR,
                                                                '&.Mui-disabled': {
                                                                    color: `${LIGHT_TEXT_COLOR} !important`
                                                                },
                                                                '&:hover': { color: TEXT_COLOR },
                                                                border: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.7)}`,
                                                                borderRadius: 1,
                                                                padding: '6px',
                                                                height: '32px',
                                                                width: '32px',
                                                            }}
                                                        >
                                                            <FlagIcon fontSize="inherit" />
                                                        </IconButton>
                                                    </Box>

                                                    {/* 작성자 대상 액션 그룹 (수정, 삭제) */}
                                                    {comment.username === user?.username && (
                                                        <Box
                                                            sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2, pl: 2, borderLeft: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` }}
                                                        >
                                                            {editingCommentId === comment.id ? (
                                                                <>
                                                                    {/* 저장 버튼 (Edit -> Save) */}
                                                                    <ActionButton
                                                                        variant="contained"
                                                                        size="small"
                                                                        onClick={() => handleCommentEditSave(comment.id)}
                                                                        sx={{ minWidth: '50px', p: '4px 8px', height: '32px' }}
                                                                    >
                                                                        저장
                                                                    </ActionButton>
                                                                    {/* 취소 버튼 */}
                                                                    <ActionButton
                                                                        variant="outlined"
                                                                        size="small"
                                                                        onClick={handleCommentEditCancel}
                                                                        sx={{ minWidth: '50px', p: '4px 8px', height: '32px' }}
                                                                    >
                                                                        취소
                                                                    </ActionButton>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {/* 수정 버튼 */}
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleCommentEditToggle(comment.id, comment.content)}
                                                                        sx={{
                                                                            color: LIGHT_TEXT_COLOR,
                                                                            '&:hover': { color: TEXT_COLOR },
                                                                            border: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.7)}`,
                                                                            borderRadius: 1,
                                                                            padding: '6px',
                                                                            height: '32px',
                                                                            width: '32px',
                                                                        }}
                                                                    >
                                                                        <EditIcon fontSize="inherit" />
                                                                    </IconButton>

                                                                    {/* 삭제 버튼 (게시글 삭제 버튼 디자인 참고) */}
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        onClick={() => handleCommentDelete(comment.id)}
                                                                        sx={{
                                                                            // 게시글 삭제 버튼 디자인 참고
                                                                            backgroundColor: RED_COLOR,
                                                                            color: BG_COLOR,
                                                                            '&:hover': {
                                                                                backgroundColor: alpha(RED_COLOR, 0.9),
                                                                            },
                                                                            border: `1px solid ${RED_COLOR}`,
                                                                            minWidth: 'auto',
                                                                            padding: '6px',
                                                                            height: '32px',
                                                                            width: '32px',
                                                                            fontSize: '0.8rem',
                                                                        }}
                                                                    >
                                                                        <DeleteIcon fontSize='small' />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        }
                                        // ListItemText의 secondary 컨텐츠를 <div>로 렌더링하도록 강제
                                        slotProps={{ secondary: { component: 'div' } }}
                                        sx={{ width: '100%', m: 0 }}
                                    />
                                </ListItem>
                            )})}
                    </List>

                </DetailCard>
            </Container>
        </DetailWrapper>
    );
};

export default PostsDetail;