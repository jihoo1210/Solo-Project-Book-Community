// src/components/PostsDetail.js

import React, { useState, useEffect } from 'react'; 
import { 
    Box, Container, Typography, Paper, Chip, Button, Divider, 
    List, ListItem, ListItemText, TextField, IconButton,
    CircularProgress 
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp'; 
import FlagIcon from '@mui/icons-material/Flag'; 
import { useAuth } from '../auth/AuthContext';
import apiClient from '../../api/Api-Service'; // API 서비스 추가

// 상수 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';
const HEADER_HEIGHT = '64px'; 
const RED_COLOR = '#f44336';
// 🛠️ 보라색 상수 추가 (자연스러운 보라색 - MUI Purple 계열)
const PURPLE_COLOR = '#9c27b0';
const DARK_PURPLE_COLOR = '#6a1b9a'; // 보라색 호버/어두운 버전

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

const ActionButton = styled(Button)(({ theme, colorName }) => ({
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

    // 1. 질문 게시글 상세 정보 (PostCreate.js의 QuestionFields에 대응)
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
    
    // 2. 모집 게시글 상세 정보 (PostCreate.js의 RecruitmentFields에 대응)
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

// ------------------------------------------------------------------------

/**
 * 🛠️ 작성일 형식: PostsList.js와 동일한 조건부 로직 적용
 */
const formatDate = (dateString) => {
    if (!dateString) return '';
        const postDate = new Date(dateString);
        const month = String(postDate.getMonth() + 1).padStart(2, '0');
        const day = String(postDate.getDate()).padStart(2, '0');
        const hours = String(postDate.getHours()).padStart(2, '0');
        const minutes = String(postDate.getMinutes()).padStart(2, '0');
        return `${month}/${day} ${hours}:${minutes}`;
};


const PostsDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // API 연동을 위한 상태 및 로딩 관리 (Mock 데이터 제거)
    const [post, setPost] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [postLikes, setPostLikes] = useState(0);
    // 🛠️ `alreadySavedInLikes` 초기값을 `false`로 설정 (로그인하지 않은 사용자 기준)
    const [alreadySavedInLikes, setAlreadySavedInLikes] = useState(false)
    // 댓글 입력 상태 추가
    const [newCommentText, setNewCommentText] = useState('');
    const [comments, setComments] = useState([]); 

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
                    // API 응답에서 좋아요 수와 댓글 목록을 초기화
                    setPostLikes(postData.likes || 0);
                    // 🛠️ 좋아요 등록 여부 초기화 (API 응답에서 좋아요 여부 필드가 있다고 가정)
                    setAlreadySavedInLikes(postData.alreadySavedInLikes || false);
                    // API에서 받아온 댓글 데이터에 id가 없는 경우를 대비하여 목 데이터 구조 유지
                    // setComments(postData.comments?.map((comment, index) => ({
                    //     id: comment.id || `mock-id-${index}`,
                    //     writer: comment.writer || '익명',
                    //     date: comment.date || new Date().toISOString(),
                    //     text: comment.text,
                    //     likes: comment.likes || 0
                    // })) || []);

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

    const handlePostLike =  () => {
        const increaseLikeCount = async () => {
            try {
                const response = await apiClient.get(`/posts/${id}/handle-likes`)
                const isSavedInLikes = response.data.result.savedInLikes;
                
                // 🛠️ API 응답에 따라 상태 변경 (좋아요 등록/취소 여부)
                setAlreadySavedInLikes(isSavedInLikes)
                
                // '좋아요에 등록했음' 여부
                if(isSavedInLikes) {
                    setPostLikes(postLikes + 1)
                } else {
                    setPostLikes(postLikes - 1)
                }
            } catch(err) {
                console.error("좋아요 증가 오류:", err.response?.data?.message || err.message);
                // 🛠️ 오류 발생 시 에러 메시지만 설정하고, post 상태는 유지하여 화면에 표시
                setError("좋아요 처리 중 오류가 발생했습니다.");
            }
        }
        increaseLikeCount();
    };

    const handleCommentLike = (commentId) => {
        // 실제 API 호출 로직 (댓글 좋아요 API)은 여기에 추가됩니다.
        // 예를 들어: apiClient.post(`/comment/${commentId}/like`);
        setComments(prevComments => 
            prevComments.map(comment => 
                comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment
            )
        );
    };
    
    // 댓글 등록 핸들러 추가
    const handleCommentSubmit = async () => {
        if (!newCommentText.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        // 실제 API 호출 로직 (댓글 등록 API)은 여기에 추가됩니다.
        // const newComment = await apiClient.post(`/posts/${id}/comments`, { text: newCommentText });

        // API 연동 전 임시 처리
        const mockNewComment = {
            id: `mock-new-${Date.now()}`,
            writer: user?.username || 'Guest',
            date: new Date().toISOString(), // 원본 코드에서는 formatDate()를 썼지만, 임시 데이터에선 ISO string으로 저장 후 렌더링 시 formatDate() 호출
            text: newCommentText,
            likes: 0
        };

        setComments(prev => [mockNewComment, ...prev]); // 새 댓글을 목록 맨 앞에 추가
        setNewCommentText('');
    };

    const handleReport = (type, targetId) => {
        if (window.confirm(`${type} (${targetId})를 신고하시겠습니까? 신고 후에는 되돌릴 수 없습니다.`)) {
            // 실제 신고 API 호출 로직은 여기에 추가됩니다.
            alert(`${type} (${targetId})를 신고했습니다. 감사합니다.`);
        }
    };

    const handleEdit = () => {
        console.log(`게시글 ${id} 수정`);
        navigate(`/post/edit/${id}`);
    };

    const handleDelete = async () => {
        if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
            console.log(`게시글 ${id} 삭제`);
            try {
                    const postResponse = await apiClient.delete(`/posts/${id}`)
                    if(postResponse.data.result.id) {
                        alert(`${id}번 게시글이 성공적으로 삭제되었습니다.`)
                    } else {
                        setError(`${id}번 게시글을 삭제하는데 실패했습니다.`)
                    }
                    navigate('/')
            } catch (err) {
                alert('에러 발생:' + err.response.data.message || '예상하지 못한 에러.')
            }
            // 삭제 API 호출 후 navigate('/');
        }
    };

    // 🛠️ 재사용 가능한 수정/삭제 버튼 그룹 정의 (MD 이상에서는 minWidth 유지, SM 이하에서는 조정)
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
        // 🛠️ DetailWrapper 내부 Box에 모바일 padding 반영
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
        // 🛠️ DetailWrapper 내부 Box에 모바일 padding 반영
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
                            <Button component={Link} to="/" startIcon={<ArrowBackIcon />}>목록으로</Button>
                        </Box>
                    </Box>
                </Container>
            </DetailWrapper>
        );
    }
    
    // post 객체가 있을 때만 렌더링
    return (
        <DetailWrapper>
            {/* 🛠️ 1. 목록 버튼과 수정/삭제 버튼을 포함할 최상단 Box 수정: MD 이상에서는 기존 디자인 유지, SM 이하에서는 한 줄에 정렬 */}
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
                        to="/" 
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: TEXT_COLOR, '&:hover': { backgroundColor: alpha(TEXT_COLOR, 0.05) } }}
                    >
                        목록으로
                    </Button>
                    
                    {/* 🛠️ 2. 수정/삭제 버튼 (모바일에서만 표시) */}
                    {user?.username === post.username && 
                        <Box sx={(theme) => ({ 
                            display: { xs: 'flex', md: 'none' }, // SM 이하에서만 표시, MD 이상에서는 숨김
                            gap: 1, 
                            flexShrink: 0, 
                            // 모바일에서 버튼 크기 조정으로 반응성 확보
                            '& > *': { 
                                minWidth: 'auto', 
                                padding: theme.spacing(0.5, 1),
                                fontSize: '0.75rem' // ActionButton 기본 폰트 사이즈보다 약간 작게 조정
                            }
                        })}>
                            {EditDeleteButtons}
                        </Box>
                    }
                </Box>
                
                <DetailCard elevation={0}>
                    {/* 🛠️ DetailCard 내부 Box에 모바일 padding 추가 */}
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
                            <Typography variant="body2">
                                작성일: {formatDate(post.modifiedDate)} {/* 🛠️ formatDate 적용 */}
                            </Typography>
                        </Box>
                    </Box>

                    {/* 조건부 상세 정보 표시 (내부에서 모바일 패딩 처리됨) */}
                    <SubjectSpecificDetails post={post} /> 

                    {/* 🚨 HTML 렌더링을 위한 dangerouslySetInnerHTML 유지 */}
                    {/* 🛠️ Box에 모바일 padding 추가 */}
                    <Box sx={(theme) => ({ 
                        p: 3, 
                        minHeight: '200px', 
                        border: `1px solid ${LIGHT_TEXT_COLOR}`, 
                        borderRadius: 1, 
                        mb: 4,
                        '& p': { margin: '0 0 1em 0' }, 
                        '& strong': { fontWeight: 700, color: TEXT_COLOR },
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
                    {/* 🛠️ Box에 모바일 padding 추가 */}
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
                            startIcon={<ThumbUpIcon />}
                            onClick={handlePostLike}
                            // 🛠️ `alreadySavedInLikes` 값에 따라 버튼 스타일 동적 변경
                            sx={{
                                color: alreadySavedInLikes ? BG_COLOR : BG_COLOR, 
                                backgroundColor: alreadySavedInLikes ? PURPLE_COLOR : TEXT_COLOR,
                                '&:hover': { 
                                    backgroundColor: alreadySavedInLikes ? DARK_PURPLE_COLOR : LIGHT_TEXT_COLOR 
                                },
                                // 🛠️ 테두리 색상도 변경된 배경색에 맞게 조정 (좋아요 상태일 때는 테두리 제거)
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

                    {/* 🛠️ 3. 기존 수정/삭제 버튼 위치 (md 이상에서만 표시) */}
                    {/* 기존 수정/삭제 버튼 (작성자에게만 표시) */}
                    {user?.username === post.username && 
                        <Box sx={(theme) => ({ 
                            display: { xs: 'none', md: 'flex' }, // MD 이상에서만 표시 (기존 디자인 유지), SM 이하에서는 숨김
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
                    
                    {/* 🛠️ Box에 모바일 padding 추가 */}
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
                    {/* 🛠️ Box에 모바일 padding 추가 */}
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
                    {/* 🛠️ List에 모바일 margin/padding 추가 */}
                    <List sx={(theme) => ({ 
                        border: `1px solid ${LIGHT_TEXT_COLOR}`, 
                        borderRadius: 1, 
                        p: 0,
                        [theme.breakpoints.down('sm')]: {
                            marginX: theme.spacing(2), // 좌우 마진 추가
                        },
                    })}>
                        {comments.map((comment) => ( 
                            <ListItem 
                                key={comment.id}
                                disableGutters
                                sx={{ 
                                    borderBottom: comment.id !== comments[comments.length - 1]?.id ? `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` : 'none', 
                                    py: 1.5,
                                    px: 2,
                                    flexDirection: 'column', 
                                    alignItems: 'flex-start'
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, width: '100%' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: TEXT_COLOR }}>{comment.writer}</Typography>
                                            <Typography variant="caption" color={LIGHT_TEXT_COLOR}>{formatDate(comment.date)}</Typography> {/* 🛠️ formatDate 적용 */}
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ width: '100%' }}>
                                            <Typography variant="body2" color={TEXT_COLOR} sx={{ mb: 1 }}>{comment.text}</Typography>
                                            
                                            {/* 댓글 좋아요/신고 버튼 및 좋아요 수 표시 */}
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center', mt: 1 }}>
                                                <Typography variant="caption" color={LIGHT_TEXT_COLOR} sx={{ fontWeight: 600, mr: 0.5 }}>
                                                    좋아요: {comment.likes}
                                                </Typography>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleCommentLike(comment.id)} 
                                                    sx={{ color: LIGHT_TEXT_COLOR, '&:hover': { color: TEXT_COLOR } }}
                                                >
                                                    <ThumbUpIcon fontSize="inherit" />
                                                </IconButton>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleReport('댓글', comment.id)}
                                                    sx={{ color: LIGHT_TEXT_COLOR, '&:hover': { color: TEXT_COLOR } }}
                                                >
                                                    <FlagIcon fontSize="inherit" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    }
                                    sx={{ width: '100%', m: 0 }}
                                />
                            </ListItem>
                        ))}
                    </List>

                </DetailCard>
            </Container>
        </DetailWrapper>
    );
};

export default PostsDetail;