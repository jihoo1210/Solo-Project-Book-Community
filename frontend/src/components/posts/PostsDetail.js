// src/components/PostsDetail.js

// 💡 수정: TiptapEditor, useRef, useCallback, List, ListItem, ListItemText, TextField, IconButton 제거
import React, { useState, useEffect } from 'react'; 
import {
    Box, Container, Typography, Paper, Chip, Button, Divider,
    CircularProgress
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { 
    Link, useNavigate, useParams, 
    useLocation 
} from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import { useAuth } from '../auth/AuthContext';
import apiClient from '../../api/Api-Service'; 
// 💡 수정: PeopleAlt 아이콘만 남기고 CheckCircle 아이콘 제거
import { Favorite, PeopleAlt } from '@mui/icons-material';
import { 
    BG_COLOR, TEXT_COLOR, LIGHT_TEXT_COLOR, 
    RED_COLOR, PURPLE_COLOR, DARK_PURPLE_COLOR, MODIFIED_COLOR, HEADER_HEIGHT
} from '../constants/Theme';
import { getPostDateInfo } from '../utilities/DateUtiles';

// 💡 추가: 분리된 댓글 섹션 컴포넌트를 import
import CommentsSection from './comment/CommentSection';


// 스타일 컴포넌트 정의 (DetailWrapper, DetailCard, ActionButton, StyledChip, DetailItem, SubjectSpecificDetails는 그대로 유지)
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


// ------------------ 게시글 타입별 상세 정보 표시 컴포넌트 (유지) ------------------
const DetailItem = ({ label, value }) => {
    if (!value) return null;
    return (
        <Box sx={{ mb: 1.5, minWidth: '100%' }}>
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

    if (post.subject === '질문' && (post.bookTitle || post.pageNumber)) {
        return (
            <Box sx={commonSx}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: TEXT_COLOR }}>
                    질문 상세 정보
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', '& > *': { minWidth: '100%' } }}>
                    <DetailItem label="참고 서적" value={post.bookTitle} />
                    <DetailItem label="페이지" value={post.pageNumber + 'p'} />
                </Box>
            </Box>
        );
    }

    if (post.subject === '모집' && (post.region || post.meetingInfo || post.maxUserNumber || post.currentUserNumber !== undefined)) {
        
        const hasMaxUserNumber = post.maxUserNumber && post.currentUserNumber !== undefined;
        
        const recruitmentStatus = hasMaxUserNumber 
            ? `${post.currentUserNumber}/${post.maxUserNumber}` 
            : null;
        
        const isRecruitmentComplete = hasMaxUserNumber && post.currentUserNumber >= post.maxUserNumber;

        const RecruitmentStatusItem = hasMaxUserNumber ? (
            <Box sx={{ mb: 1.5, minWidth: '100%' }}>
                <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: TEXT_COLOR, display: 'block', mb: 0.5 }}
                >
                    모집 현황
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleAlt sx={{ mr: 0.5, color: TEXT_COLOR }} fontSize="small" /> 
                    <Typography
                        variant="body1"
                        color={isRecruitmentComplete ? RED_COLOR : TEXT_COLOR}
                        sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontWeight: isRecruitmentComplete ? 700 : 400 }}
                    >
                        {recruitmentStatus}
                        {isRecruitmentComplete && <Box component="span" sx={{ ml: 1, color: RED_COLOR }}>[마감]</Box>}
                    </Typography>
                </Box>
            </Box>
        ) : null;


        return (
            <Box sx={commonSx}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: TEXT_COLOR }}>
                    모집 상세 정보
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', '& > *': { minWidth: '100%' } }}>
                    <DetailItem label="모임 지역" value={post.region} />
                    <DetailItem label="모임 일정" value={post.meetingInfo} />
                    
                    {RecruitmentStatusItem} 
                </Box>
            </Box>
        );
    }

    return null;
};


// ------------------ PostsDetail 메인 컴포넌트 ------------------
const PostsDetail = () => {
    const { id } = useParams();
    const location = useLocation(); 
    const { user } = useAuth();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const fromParam = queryParams.get('from');
    
    const backToPath = fromParam === 'my-actives' 
        ? '/my/actives' 
        : fromParam === 'my-favorite' ? '/my/favorite'
        : fromParam === 'my-alerts' ? '/my/alerts' : '/'
    
    // 💡 수정: comments, commentsListRef, newCommentText 등 댓글 관련 상태/Ref 제거
    // API 연동을 위한 상태 및 로딩 관리
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [postLikes, setPostLikes] = useState(0);
    const [savedInPostLikes, setSavedInPostLikes] = useState(false)
    const [isSavedInRecruitment, setIsSavedInRecruitment] = useState(false);
    const [initialComments, setInitialComments] = useState([]); // 💡 CommentsSection에 전달할 초기 댓글 목록

    // 💡 추가: CommentsSection에서 채택 상태를 업데이트하기 위한 함수
    const setPostAdoptedId = (commentId) => {
        setPost(prevPost => ({
            ...prevPost,
            adoptedCommentId: commentId,
        }));
    };

    // API 호출 로직 (게시글 상세 정보 및 댓글 가져오기)
    useEffect(() => {
        const fetchPostDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const postResponse = await apiClient.get(`/posts/${id}`);
                const postData = postResponse.data.result;

                if (postData) {
                    setPost(postData);
                    setPostLikes(postData.likes || 0);
                    setSavedInPostLikes(postData.savedInLikes || false);
                    setIsSavedInRecruitment(postData.savedInRecruitment || false);
                    setInitialComments(postData.comments || []) // 💡 댓글 목록 상태 분리
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
    }, [id]); 


    // 게시글 좋아요 처리
    const handlePostLike = () => {
        const increaseLikeCount = async () => {
            try {
                const response = await apiClient.get(`/posts/${id}/handle-likes`)
                const isSavedInPostLikes = response.data.result.savedInLikes;

                setSavedInPostLikes(isSavedInPostLikes)

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

    // 신고 핸들러
    const handleReport = (type, targetId) => {
        if (window.confirm(`${type} (${targetId})를 신고하시겠습니까? 신고 후에는 되돌릴 수 없습니다.`)) {
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
                navigate(backToPath) 
            } catch (err) {
                alert('에러 발생:' + err.response.data.message || '예상하지 못한 에러.')
            }
        }
    };


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
                            <Button component={Link} to={backToPath} startIcon={<ArrowBackIcon />}>목록으로</Button>
                        </Box>
                    </Box>
                </Container>
            </DetailWrapper>
        );
    }

    // 게시글 날짜 정보 가져오기 
    const postDateInfo = getPostDateInfo(post.modifiedDate, post.createdDate);

    // post 객체가 있을 때만 렌더링
    return (
        <DetailWrapper>
            <Container maxWidth="lg">
                <Box sx={(theme) => ({
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingLeft: '0px !important',
                    [theme.breakpoints.down('sm')]: {
                        paddingX: theme.spacing(2),
                    },
                })}>
                    <Button
                        component={Link}
                        to={backToPath} 
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: TEXT_COLOR, '&:hover': { backgroundColor: alpha(TEXT_COLOR, 0.05) } }}
                    >
                        목록으로
                    </Button>

                    {user?.username === post.username &&
                        <Box sx={(theme) => ({
                            display: { xs: 'flex', md: 'none' }, 
                            gap: 1,
                            flexShrink: 0,
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
                    </Box>

                    <SubjectSpecificDetails post={post} />

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
                            sx={{
                                color: savedInPostLikes ? BG_COLOR : BG_COLOR,
                                backgroundColor: savedInPostLikes ? PURPLE_COLOR : TEXT_COLOR,
                                '&:hover': {
                                    backgroundColor: savedInPostLikes ? DARK_PURPLE_COLOR : LIGHT_TEXT_COLOR
                                },
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

                    {user?.username === post.username &&
                        <Box sx={(theme) => ({
                            display: { xs: 'none', md: 'flex' }, 
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

                    {/* 💡 수정: CommentsSection 컴포넌트 호출 및 props 전달 */}
                    <CommentsSection
                        postId={id}
                        postSubject={post.subject}
                        postAuthorUsername={post.username}
                        adoptedCommentId={post.adoptedCommentId}
                        setPostAdoptedId={setPostAdoptedId}
                        initialComments={initialComments}
                        isSavedInRecruitmentProp={isSavedInRecruitment}
                    />

                </DetailCard>
            </Container>
        </DetailWrapper>
    );
};

export default PostsDetail;