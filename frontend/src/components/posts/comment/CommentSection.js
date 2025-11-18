// src/components/CommentsSection.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, Paper, Button, Divider,
    List, ListItem, ListItemText, TextField, IconButton
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Favorite, CheckCircle, Edit, Delete, Flag } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; 
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'; 
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'; 

import { useAuth } from '../../auth/AuthContext';
import apiClient from '../../../api/Api-Service'; 
import { 
    BG_COLOR, TEXT_COLOR, LIGHT_TEXT_COLOR, 
    RED_COLOR, PURPLE_COLOR, DARK_PURPLE_COLOR, MODIFIED_COLOR, AQUA_BLUE, DARK_AQUA_BLUE,
    RECRUIT_ACCENT_COLOR, RECRUIT_DARK_COLOR, RECRUIT_LIGHT_BG,
    RECRUIT_APPROVE_COLOR,
    NEW_COLOR
} from '../../constants/Theme'; 
import { getPostDateInfo } from '../../utilities/DateUtiles'; 


const AdoptedCommentWrapper = styled(Paper)(({ theme }) => ({
    backgroundColor: AQUA_BLUE, 
    color: BG_COLOR, 
    padding: theme.spacing(2, 3),
    borderRadius: (theme.shape?.borderRadius || 4) * 2,
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    marginBottom: theme.spacing(3), 
}));

const ApplicationWrapper = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: RECRUIT_LIGHT_BG,
    border: `1px solid ${alpha(RECRUIT_ACCENT_COLOR, 0.4)}`,
    borderRadius: theme.shape?.borderRadius || 4,
    marginBottom: theme.spacing(3),
}));

const ApplicationCompleteMessage = styled(ApplicationWrapper)(({ theme, statusType }) => ({
    // 승인/신청: RECRUIT_ACCENT_COLOR 기반 / 거절: RED_COLOR 기반
    backgroundColor: alpha((statusType === '거절' || statusType === '마감') ? RED_COLOR : statusType === "승인" ? RECRUIT_APPROVE_COLOR : RECRUIT_ACCENT_COLOR, 0.1), 
    border: `1px solid ${(statusType === '거절' || statusType === '마감') ? RED_COLOR : statusType === "승인" ? RECRUIT_APPROVE_COLOR : RECRUIT_ACCENT_COLOR}`, 
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '150px',
}));


/**
 * 게시글의 댓글 영역을 담당하는 컴포넌트
 * @param {string} props.postId - 현재 게시글의 ID
 * @param {string} props.postSubject - 현재 게시글의 Subject (질문/모집/공유)
 * @param {string} props.postAuthorUsername - 현재 게시글 작성자의 사용자 이름
 * @param {number | null} props.adoptedCommentId - 채택된 댓글의 ID
 * @param {function} props.setPostAdoptedId - 부모 상태(post)의 adoptedCommentId를 업데이트하는 함수
 * @param {Array<object>} props.initialComments - API에서 받은 초기 댓글 목록
 * @param {string | null} props.recruitmentResultProp - 현재 사용자의 모임 신청 결과 (null/신청/승인/거절)
 */
const CommentsSection = ({ 
    postId, 
    postSubject,
    postAuthorUsername, 
    adoptedCommentId,
    setPostAdoptedId,
    initialComments,
    recruitmentResultProp // Prop 이름 변경
}) => {
    
    const { user } = useAuth();
    const commentsListRef = useRef(null);

    const [comments, setComments] = useState(initialComments);
    const [newCommentText, setNewCommentText] = useState('');
    
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');

    // recruitmentResultProp으로 초기화
    const [recruitmentResult, setRecruitmentResult] = useState(recruitmentResultProp)
    const [applicationText, setApplicationText] = useState('');

    useEffect(() => {
        setComments(initialComments);
    }, [initialComments]);

    useEffect(() => {
        setRecruitmentResult(recruitmentResultProp);
    }, [recruitmentResultProp]);


    const handleCommentEditCancel = useCallback(() => {
        setEditingCommentId(null);
        setEditingCommentContent('');
    }, []); 

    const handleOutsideClick = useCallback((event) => {
        if (editingCommentId && commentsListRef.current && !commentsListRef.current.contains(event.target)) {
            handleCommentEditCancel();
        }
    }, [editingCommentId, handleCommentEditCancel]); 

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && editingCommentId) {
                handleCommentEditCancel();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        document.addEventListener('mousedown', handleOutsideClick); 

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [editingCommentId, handleOutsideClick, handleCommentEditCancel]); 

    const handleCommentLike = async (commentId) => {
        try {
            const response = await apiClient.get(`/comment/${commentId}/handle-likes`)
            const isSavedInCommentLikes = response.data.result.savedInLikes

            setComments(prevComments => prevComments.map(comment => {
                const updatedComment = {
                    ...comment,
                    savedInLikes: isSavedInCommentLikes,
                    likes: isSavedInCommentLikes ? comment.likes + 1 : comment.likes - 1
                }
                return comment.id === commentId ? updatedComment : comment
            }))
        } catch (err) {
            console.error("댓글 좋아요 증감 오류:", err.response?.data?.message || err.message);
        }
    };

    const handleReport = (type, targetId) => {
        if (window.confirm(`${type} (${targetId})를 신고하시겠습니까? 신고 후에는 되돌릴 수 없습니다.`)) {
            alert(`${type} (${targetId})를 신고했습니다. 감사합니다.`);
        }
    };

    const handleCommentEditToggle = (commentId, content) => {
        if (editingCommentId === commentId) {
            handleCommentEditCancel(); 
        } else {
            setEditingCommentId(commentId);
            setEditingCommentContent(content);
        }
    };

    const handleCommentEditSave = async (commentId) => {
        if (!editingCommentContent.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        try {
            const response = await apiClient.patch(`/comment/${commentId}`, {content: editingCommentContent})
            const { content: newContent, modifiedDate: newModifiedDate } = response.data.result; 
            
            if (newContent) {
                setComments(prevComments => prevComments.map(comment =>
                    comment.id === commentId ? { 
                        ...comment, 
                        content: newContent, 
                        modifiedDate: newModifiedDate 
                    } : comment
                ));
            }
        } catch(err) {
            console.error("댓글 수정 오류:", err.response?.data?.message || err.message);
            alert("댓글 수정 중 오류가 발생했습니다.");
        } finally {
            handleCommentEditCancel();
        }
    };

    const handleCommentSubmit = async () => {
        if (!newCommentText.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        const requestBody = {
            content: newCommentText
        }

        try {
            const response = await apiClient.post(`/comment/${postId}`, requestBody)
            const commentData = response.data.result
            if (response.data.result) {
                const newComment = {
                    id: commentData.id,
                    content: commentData.content,
                    username: commentData.username,
                    createdDate: commentData.createdDate, 
                    modifiedDate: commentData.modifiedDate,
                    likes: commentData.likes || 0,
                    savedInLikes: false 
                }
                setComments(prev => [newComment, ...prev]) 
                setNewCommentText('');
            }
        } catch (err) {
            console.error("댓글 생성 오류:", err.response?.data?.message || err.message);
            alert("댓글 생성 중 오류가 발생했습니다.");
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
            try {
                const postResponse = await apiClient.delete(`/comment/${commentId}`)
                if (postResponse.data.result.id) {
                    setComments(prevComments => prevComments.filter(comment => comment.id !== commentId))
                } else {
                    alert(`${commentId}번 댓글을 삭제하는데 실패했습니다.`)
                }
            } catch (err) {
                alert('에러 발생:' + err.response.data.message || '예상하지 못한 에러.')
            }
        }
    }

    const handleCommentAdopt = async (commentId) => {
        if (postSubject !== '질문' || user?.username !== postAuthorUsername) {
            alert('질문 게시글의 작성자만 댓글을 채택할 수 있습니다.');
            return;
        }

        if (adoptedCommentId) {
             alert('이미 댓글이 채택되었습니다.');
             return;
        }

        if (window.confirm('이 댓글을 채택하시겠습니까? 채택된 댓글은 취소가 불가능할 수 있습니다.')) {
            try {
                await apiClient.post(`/comment/${commentId}/adopt`);
                
                setPostAdoptedId(commentId);
                
            } catch (err) {
                console.error("댓글 채택 오류:", err.response?.data?.message || err.message);
                alert("댓글 채택 중 오류가 발생했습니다: " + (err.response?.data?.message || '알 수 없는 오류'));
            }
        }
    }

    const handleApplicationSubmit = async () => {
        if (!applicationText.trim()) {
            alert("신청 내용을 입력해주세요.");
            return;
        }

        try {
            await apiClient.post(`/comment/${postId}/apply-recruitment`, {content: applicationText})

            setApplicationText('');
            setRecruitmentResult('신청') // 요청 1: 신청 상태로 업데이트
        } catch (err) {
            console.error("모임 신청 오류:", err.response?.data?.message || err.message);
            alert("모임 신청 중 오류가 발생했습니다.");
        }
    };


    const adoptedComment = comments.find(c => c.id === adoptedCommentId);
    const filteredComments = comments.filter(c => c.id !== adoptedCommentId);

    const isQuestionPostAuthor = postSubject === '질문' && user?.username === postAuthorUsername;
    const isSolved = !!adoptedCommentId;
    
    const isRecruitPost = postSubject === '모집';

    const renderApplicationStatus = () => {
        // Case 4: recruitmentResult === null (신청 폼)
        if (!recruitmentResult) {
            return (
                <ApplicationWrapper>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            fontWeight: 700, 
                            color: RECRUIT_ACCENT_COLOR,
                            mb: 1.5,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        ✨ 모임 신청
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="모임 신청 내용을 입력하세요. (ex. 자기소개, 참여 의지, 연락처 등)"
                        variant="outlined"
                        value={applicationText}
                        onChange={(e) => setApplicationText(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: alpha(RECRUIT_ACCENT_COLOR, 0.6) }, 
                                '&:hover fieldset': { borderColor: RECRUIT_ACCENT_COLOR },
                                '&.Mui-focused fieldset': { borderColor: RECRUIT_ACCENT_COLOR, borderWidth: '2px' }, 
                            },
                            mb: 1
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleApplicationSubmit}
                            sx={{
                                color: BG_COLOR,
                                backgroundColor: RECRUIT_ACCENT_COLOR,
                                fontWeight: 600,
                                padding: (theme) => theme.spacing(1, 3),
                                minWidth: '120px',
                                '&:hover': { backgroundColor: RECRUIT_DARK_COLOR },
                            }}
                        >
                            모임 신청
                        </Button>
                    </Box>
                </ApplicationWrapper>
            )
        }
        
        // Case 1, 2, 3: 신청, 승인, 거절 상태 표시
        let message, subMessage, icon, color;

        switch (recruitmentResult) {
            case '신청': // 요청 1
                message = '신청되었습니다.';
                subMessage = '신청 내용은 작성자에게 전달되었으며, 승인을 기다리고 있습니다.';
                icon = <CheckCircleOutlineIcon />;
                color = RECRUIT_ACCENT_COLOR;
                break;
            case '승인': // 요청 2
                message = '승인되었습니다.';
                subMessage = '모임 참여가 확정되었습니다.';
                icon = <ThumbUpOutlinedIcon />;
                color = RECRUIT_APPROVE_COLOR;
                break;
            case '거절': // 요청 3
                message = '거절되었습니다.';
                subMessage = '자세한 정보를 알고 싶다면 알림 보관함으로 이동하세요.';
                icon = <CancelOutlinedIcon />;
                color = RED_COLOR;
                break;
            case '마감':
                message = '마감되었습니다.';
                subMessage = '해당 모집은 마감되었습니다.';
                icon = <CancelOutlinedIcon />;
                color = RED_COLOR;
                break;
            default:
                // 다른 알 수 없는 상태는 폼으로 대체
                return null;
        }

        return (
            <ApplicationCompleteMessage statusType={recruitmentResult}>
                {React.cloneElement(icon, { 
                    sx: { 
                        fontSize: 48, 
                        color: color, 
                        mb: 1.5 
                    } 
                })}
                <Typography 
                    variant="h6" 
                    sx={{ 
                        fontWeight: 700, 
                        color: color 
                    }}
                >
                    {message}
                </Typography>
                <Typography 
                    variant="body2" 
                    sx={{ 
                        mt: 1, 
                        color: alpha(color, 0.8) 
                    }}
                >
                    {subMessage}
                </Typography>
                {recruitmentResult === '거절' && (
                    <Button 
                        variant="text" 
                        size="small"
                        component={Link} 
                        to="/my/alerts" 
                        sx={{ 
                            mt: 1, 
                            color: RED_COLOR, 
                            fontSize: '0.8rem', 
                            p: 0, 
                            minWidth: 'auto' 
                        }}
                    >
                        알림 보관함으로 이동
                    </Button>
                )}
                {recruitmentResult === '승인' && (
                                        <Button 
                        variant="text" 
                        size="small"
                        component={Link} 
                        to={`/chat/list`} 
                        sx={{ 
                            mt: 1, 
                            color: NEW_COLOR, 
                            fontSize: '0.8rem', 
                            p: 0, 
                            minWidth: 'auto' 
                        }}
                    >
                        알림 보관함으로 이동
                    </Button>
                )}
            </ApplicationCompleteMessage>
        )
    }

    return (
        <>
            {isRecruitPost && (
                <Box sx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                        marginX: theme.spacing(2),
                    },
                })}>
                    {renderApplicationStatus()}
                </Box>
            )}

            <Box sx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                    paddingX: theme.spacing(2),
                },
            })}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_COLOR, mb: 2 }}>
                    댓글 ({comments.length})
                </Typography>
            </Box>

            {adoptedComment && (
                <Box sx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                        paddingX: theme.spacing(2),
                    },
                })}>
                    <AdoptedCommentWrapper elevation={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: BG_COLOR, display: 'flex', alignItems: 'center' }}>
                                <CheckCircle fontSize="small" sx={{ mr: 0.5 }} />
                                채택된 답변
                            </Typography>
                            <Typography variant="caption" sx={{ color: BG_COLOR, opacity: 0.9 }}>
                                {adoptedComment.username} ({getPostDateInfo(adoptedComment.modifiedDate, adoptedComment.createdDate).dateDisplay})
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 1, borderColor: alpha(BG_COLOR, 0.7) }} />
                        <Typography variant="body1" sx={{ color: BG_COLOR, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {adoptedComment.content}
                        </Typography>
                    </AdoptedCommentWrapper>
                </Box>
            )}

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
                    <Button
                        variant="contained"
                        onClick={handleCommentSubmit}
                        sx={{
                            color: BG_COLOR,
                            backgroundColor: TEXT_COLOR,
                            fontWeight: 600,
                            padding: (theme) => theme.spacing(1, 3),
                            minWidth: '120px',
                            '&:hover': { backgroundColor: LIGHT_TEXT_COLOR },
                        }}
                    >
                        등록
                    </Button>
                </Box>
            </Box>

            <List
                ref={commentsListRef}
                sx={(theme) => ({
                    border: `1px solid ${LIGHT_TEXT_COLOR}`,
                    borderRadius: 1,
                    p: 0,
                    [theme.breakpoints.down('sm')]: {
                        marginX: theme.spacing(2), 
                    },
                })}>
                {filteredComments
                    .filter(comment => comment)
                    .map((comment, index, arr) => {
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
                                alignItems: 'flex-start',
                            }}
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, width: '100%' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: TEXT_COLOR }}>{comment.username}</Typography>
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
                                    <Box sx={{ width: '100%' }}>
                                        {editingCommentId === comment.id ? (
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={3}
                                                value={editingCommentContent}
                                                onChange={(e) => setEditingCommentContent(e.target.value)}
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

                                        <Box
                                            sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center', mt: 1 }}
                                        >
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleCommentLike(comment.id)}
                                                    disabled={editingCommentId === comment.id}
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
                                                    ({comment.likes})
                                                </Button>

                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleReport('댓글', comment.id)}
                                                    disabled={editingCommentId === comment.id}
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
                                                    <Flag fontSize="inherit" />
                                                </IconButton>
                                            </Box>

                                            {comment.username === user?.username && (
                                                <Box
                                                    sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2, pl: 2, borderLeft: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` }}
                                                >
                                                    {editingCommentId === comment.id ? (
                                                        <>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={() => handleCommentEditSave(comment.id)}
                                                                sx={{ 
                                                                    minWidth: '50px', 
                                                                    p: '4px 8px', 
                                                                    height: '32px',
                                                                    color: BG_COLOR,
                                                                    backgroundColor: TEXT_COLOR,
                                                                    fontWeight: 600,
                                                                    '&:hover': { backgroundColor: LIGHT_TEXT_COLOR }
                                                                }}
                                                            >
                                                                저장
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={handleCommentEditCancel}
                                                                sx={{ minWidth: '50px', p: '4px 8px', height: '32px', color: TEXT_COLOR, borderColor: TEXT_COLOR }}
                                                            >
                                                                취소
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
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
                                                                <Edit fontSize="inherit" />
                                                            </IconButton>

                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={() => handleCommentDelete(comment.id)}
                                                                sx={{
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
                                                                <Delete fontSize='small' />
                                                            </Button>
                                                        </>
                                                    )}
                                                </Box>
                                            )}

                                            {isQuestionPostAuthor && (
                                                <Box
                                                    sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2, pl: 2, borderLeft: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` }}
                                                >
                                                    <Button
                                                        variant="contained" 
                                                        size="small"
                                                        onClick={() => handleCommentAdopt(comment.id)}
                                                        disabled={editingCommentId === comment.id || isSolved}
                                                        startIcon={null} 
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: BG_COLOR,
                                                            backgroundColor: AQUA_BLUE, 
                                                            border: '1px solid transparent',
                                                            '&:hover': {
                                                                backgroundColor: DARK_AQUA_BLUE, 
                                                            },
                                                            minWidth: 'auto',
                                                            padding: '4px 8px',
                                                            height: '32px',
                                                            fontSize: '0.8rem',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        채택
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                }
                                slotProps={{ secondary: { component: 'div' } }}
                                sx={{ width: '100%', m: 0 }}
                            />
                        </ListItem>
                    )})}
            </List>
        </>
    );
};

export default CommentsSection;