// src/components/PostsDetail.js

import React, { useState } from 'react'; 
import { 
    Box, Container, Typography, Paper, Chip, Button, Divider, 
    List, ListItem, ListItemText, TextField, IconButton 
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp'; 
import FlagIcon from '@mui/icons-material/Flag'; 
import { useAuth } from '../auth/AuthContext';

const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';
const HEADER_HEIGHT = '64px'; 

const DetailWrapper = styled(Box)(({ theme }) => ({
    marginTop: HEADER_HEIGHT, 
    minHeight: `calc(100vh - ${HEADER_HEIGHT} - 150px)`, 
    backgroundColor: BG_COLOR,
    padding: theme.spacing(4, 0),
}));

const DetailCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(5),
    borderRadius: (theme.shape?.borderRadius || 4) * 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: `1px solid ${TEXT_COLOR}`,
    backgroundColor: BG_COLOR,
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3),
    },
}));

const ActionButton = styled(Button)(({ theme, colorName }) => ({
    color: colorName === 'delete' ? BG_COLOR : TEXT_COLOR,
    backgroundColor: colorName === 'delete' ? TEXT_COLOR : BG_COLOR,
    border: `1px solid ${TEXT_COLOR}`,
    fontWeight: 600,
    padding: theme.spacing(1, 2), 
    minWidth: '100px',
    '&:hover': { 
        backgroundColor: colorName === 'delete' ? LIGHT_TEXT_COLOR : alpha(TEXT_COLOR, 0.05),
        borderColor: LIGHT_TEXT_COLOR,
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


// ------------------ NEW: 게시글 타입별 상세 정보 표시 컴포넌트 ------------------

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
    // 1. 질문 게시글 상세 정보 (PostCreate.js의 QuestionFields에 대응)
    if (post.subject === '질문' && (post.bookTitle || post.pageNumber)) {
        return (
            <Box sx={{ 
                mt: 3, mb: 4, p: 2, 
                border: `1px dashed ${LIGHT_TEXT_COLOR}`, 
                borderRadius: 1, 
                backgroundColor: alpha(TEXT_COLOR, 0.02)
            }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: TEXT_COLOR }}>
                    질문 상세 정보
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', '& > *': { minWidth: { xs: '100%', sm: '45%' } } }}>
                    <DetailItem label="참고 서적" value={post.bookTitle} />
                    <DetailItem label="페이지" value={post.pageNumber} />
                </Box>
            </Box>
        );
    }
    
    // 2. 모집 게시글 상세 정보 (PostCreate.js의 RecruitmentFields에 대응)
    if (post.subject === '모집' && (post.region || post.meetingInfo)) {
        return (
            <Box sx={{ 
                mt: 3, mb: 4, p: 2, 
                border: `1px dashed ${LIGHT_TEXT_COLOR}`, 
                borderRadius: 1, 
                backgroundColor: alpha(TEXT_COLOR, 0.02)
            }}>
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

const mockPost = { 
    id: 10, 
    subject: '모집', // <--- 현재 모집 게시글 Mock Data
    title: '사이드 프로젝트 함께 할 프론트엔드 개발자 모집', 
    writer: '프로젝트C', 
    createdDate: '2025-11-03', 
    likes: 8, 
    // 모집 필드
    region: '온라인/서울 강남', 
    meetingInfo: '매주 토요일 오후 2시', 
    // 질문 필드 (모집이므로 null)
    bookTitle: null, 
    pageNumber: null, 
    
    content: `안녕하세요, 사이드 프로젝트 팀원 모집을 위해 글을 올립니다.
    저희는 Next.js와 Typescript 기반의 소셜 미디어 서비스를 개발할 예정이며,
    현재 기획 단계에 있습니다. 함께 성장하고 포트폴리오를 만들 분을 찾습니다.
    
    관심 있으신 분들은 댓글로 지원 부탁드립니다.`,
    comments: [
        { id: 1, writer: '개발자B', text: '프로젝트 주제가 흥미롭네요. 연락처를 쪽지로 보냈습니다.', date: '2025-11-04', likes: 3 }, 
        { id: 2, writer: 'ReactGuru', text: '프론트엔드 포지션 지원합니다. 제 깃허브 링크는 ... 입니다.', date: '2025-11-04', likes: 7 }, 
    ]
};

const PostsDetail = () => {
    const { id } = useParams();
    const { user } = useAuth(); 
    const post = mockPost; 

    // 게시글과 댓글 좋아요 수 관리를 위한 상태
    const [postLikes, setPostLikes] = useState(post.likes); 
    const [comments, setComments] = useState(mockPost.comments); 

    const handlePostLike = () => {
        // 좋아요 수 증가 (요청 2)
        setPostLikes(prev => prev + 1);
        // 실제 API 호출 로직은 여기에 추가됩니다.
    };

    const handleCommentLike = (commentId) => {
        setComments(prevComments => 
            prevComments.map(comment => 
                comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment
            )
        );
        // 실제 API 호출 로직은 여기에 추가됩니다.
    };

    const handleReport = (type, targetId) => {
        if (window.confirm(`${type} (${targetId})를 신고하시겠습니까? 신고 후에는 되돌릴 수 없습니다.`)) {
            alert(`${type} (${targetId})를 신고했습니다. 감사합니다.`);
            // 실제 신고 API 호출 로직은 여기에 추가됩니다.
        }
    };

    const handleEdit = () => {
        console.log(`게시글 ${id} 수정`);
        // navigate(`/posts/edit/${id}`);
    };

    const handleDelete = () => {
        if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
            console.log(`게시글 ${id} 삭제`);
            // 삭제 API 호출 후 navigate('/');
        }
    };

    if (!post) {
        return (
            <DetailWrapper>
                <Container maxWidth="lg">
                    <Typography variant="h5" align="center" color={LIGHT_TEXT_COLOR}>게시글을 찾을 수 없습니다.</Typography>
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button component={Link} to="/" startIcon={<ArrowBackIcon />}>목록으로</Button>
                    </Box>
                </Container>
            </DetailWrapper>
        );
    }

    return (
        <DetailWrapper>
            <Container maxWidth="lg" sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}> 
                <Box sx={{ mb: 2 }}>
                    <Button 
                        component={Link} 
                        to="/" 
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: TEXT_COLOR, '&:hover': { backgroundColor: alpha(TEXT_COLOR, 0.05) } }}
                    >
                        목록으로
                    </Button>
                </Box>
                
                <DetailCard elevation={0}>
                    <Box sx={{ mb: 3 }}>
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
                                작성자: {post.writer}
                            </Typography>
                            <Typography variant="body2">
                                작성일: {post.createdDate}
                            </Typography>
                        </Box>
                    </Box>

                    {/* NEW: 조건부 상세 정보 표시 (요청 2) */}
                    <SubjectSpecificDetails post={post} /> 

                    <Box sx={{ 
                        p: 3, 
                        minHeight: '200px', 
                        border: `1px solid ${LIGHT_TEXT_COLOR}`, 
                        borderRadius: 1, 
                        whiteSpace: 'pre-wrap', 
                        mb: 4 
                    }}>
                        <Typography variant="body1" color={TEXT_COLOR}>
                            {post.content}
                        </Typography>
                    </Box>

                    {/* 게시글 본문과 댓글란 사이의 좋아요/신고 버튼 (이전 요청) */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 5 }}>
                        <ActionButton 
                            variant="contained"
                            startIcon={<ThumbUpIcon />}
                            onClick={handlePostLike}
                            sx={{
                                color: BG_COLOR, 
                                backgroundColor: TEXT_COLOR,
                                '&:hover': { backgroundColor: LIGHT_TEXT_COLOR }
                            }}
                        >
                            좋아요 ({postLikes}) {/* 요청 3 */}
                        </ActionButton>
                        <ActionButton 
                            variant="outlined"
                            startIcon={<FlagIcon />}
                            onClick={() => handleReport('게시글', id)}
                        >
                            신고
                        </ActionButton>
                    </Box>

                    {/* 기존 수정/삭제 버튼 (작성자에게만 표시) */}
                    {user?.username === post.writer && <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mb: 5 }}>
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
                    </Box>}

                    <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_COLOR, mb: 2 }}>
                        댓글 ({comments.length})
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="댓글을 입력하세요..."
                            variant="outlined"
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
                            >
                                등록
                            </ActionButton>
                        </Box>
                    </Box>

                    <List sx={{ border: `1px solid ${LIGHT_TEXT_COLOR}`, borderRadius: 1, p: 0 }}>
                        {comments.map((comment) => ( 
                            <ListItem 
                                key={comment.id}
                                disableGutters
                                sx={{ 
                                    borderBottom: comment.id !== comments.length ? `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` : 'none', 
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
                                            <Typography variant="caption" color={LIGHT_TEXT_COLOR}>{comment.date}</Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ width: '100%' }}>
                                            <Typography variant="body2" color={TEXT_COLOR} sx={{ mb: 1 }}>{comment.text}</Typography>
                                            
                                            {/* 댓글 좋아요/신고 버튼 및 좋아요 수 표시 (이전 요청 4) */}
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