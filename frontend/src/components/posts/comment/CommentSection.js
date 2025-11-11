// src/components/CommentsSection.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, Paper, Button, Divider,
    List, ListItem, ListItemText, TextField, IconButton
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Favorite, CheckCircle, Edit, Delete, Flag } from '@mui/icons-material';
// 💡 추가: 신청 완료 메시지에 사용할 아이콘 import
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; 

import { useAuth } from '../../auth/AuthContext';
import apiClient from '../../../api/Api-Service'; 
import { 
    BG_COLOR, TEXT_COLOR, LIGHT_TEXT_COLOR, 
    RED_COLOR, PURPLE_COLOR, DARK_PURPLE_COLOR, MODIFIED_COLOR, AQUA_BLUE, DARK_AQUA_BLUE,
    // 💡 추가됨: 새로운 모임 신청 색상 상수 import
    RECRUIT_ACCENT_COLOR, RECRUIT_DARK_COLOR, RECRUIT_LIGHT_BG
} from '../../constants/Theme'; // 💡 경로 및 파일명 소문자로 수정 (일반적인 컨벤션)
import { getPostDateInfo } from '../../utilities/DateUtiles'; // 💡 경로 및 파일명 소문자로 수정 (일반적인 컨벤션)

// 💡 채택된 댓글을 위한 스타일 컴포넌트
const AdoptedCommentWrapper = styled(Paper)(({ theme }) => ({
    backgroundColor: AQUA_BLUE, 
    color: BG_COLOR, 
    padding: theme.spacing(2, 3),
    borderRadius: (theme.shape?.borderRadius || 4) * 2,
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    marginBottom: theme.spacing(3), 
}));

// 💡 모임 신청 영역을 위한 스타일 컴포넌트 (심플하고 간결하게 수정)
const ApplicationWrapper = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: RECRUIT_LIGHT_BG, // 💡 새로운 옅은 배경색 사용
    border: `1px solid ${alpha(RECRUIT_ACCENT_COLOR, 0.4)}`, // 💡 새로운 액센트 색상의 옅은 테두리
    borderRadius: theme.shape?.borderRadius || 4,
    marginBottom: theme.spacing(3),
}));

// 💡 추가: 모임 신청 완료 메시지 스타일 컴포넌트
const ApplicationCompleteMessage = styled(ApplicationWrapper)(({ theme }) => ({
    // 💡 배경색과 테두리 색상만 약간 다르게 하여 시각적인 구분을 줌
    backgroundColor: alpha(RECRUIT_ACCENT_COLOR, 0.1), // 옅은 액센트 색상 배경
    border: `1px solid ${RECRUIT_ACCENT_COLOR}`, // 진한 액센트 색상 테두리
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '150px',
}));


/**
 * 게시글의 댓글 영역을 담당하는 컴포넌트
 * @param {object} props
 * @param {string} props.postId - 현재 게시글의 ID
 * @param {string} props.postSubject - 현재 게시글의 Subject (질문/모집/공유)
 * @param {string} props.postAuthorUsername - 현재 게시글 작성자의 사용자 이름
 * @param {number | null} props.adoptedCommentId - 채택된 댓글의 ID
 * @param {function} props.setPostAdoptedId - 부모 상태(post)의 adoptedCommentId를 업데이트하는 함수
 * @param {Array<object>} props.initialComments - API에서 받은 초기 댓글 목록
 * @param {boolean} props.isSavedInRecruitment - 현재 사용자가 해당 모집글에 이미 신청했는지 여부 (💡 추가)
 */
const CommentsSection = ({ 
    postId, 
    postSubject,
    postAuthorUsername, 
    adoptedCommentId,
    setPostAdoptedId,
    initialComments,
    isSavedInRecruitmentProp // 💡 prop 추가
}) => {
    
    const { user } = useAuth(); // 현재 사용자 정보
    const commentsListRef = useRef(null); // 댓글 리스트 Ref

    // 1. 댓글 관련 상태
    const [comments, setComments] = useState(initialComments);
    const [newCommentText, setNewCommentText] = useState('');
    
    // 2. 인라인 수정 상태
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');

    // 3. 모임 신청 상태 (추가됨)
    const [isSavedInRecruitment, setIsSavedInRecruitment] = useState(isSavedInRecruitmentProp)
    const [applicationText, setApplicationText] = useState('');

    // props로 받은 initialComments가 변경되면 내부 상태를 업데이트
    useEffect(() => {
        setComments(initialComments);
    }, [initialComments]);


    // ------------------ 댓글 수정 관련 핸들러 ------------------
    // 댓글 수정 취소 핸들러
    const handleCommentEditCancel = useCallback(() => {
        setEditingCommentId(null);
        setEditingCommentContent('');
    }, []); 

    // 댓글 목록 외부 클릭 감지 핸들러
    const handleOutsideClick = useCallback((event) => {
        if (editingCommentId && commentsListRef.current && !commentsListRef.current.contains(event.target)) {
            handleCommentEditCancel();
        }
    }, [editingCommentId, handleCommentEditCancel]); 

    // 댓글 수정 모드일 때 Esc 키 및 외부 클릭 이벤트 리스너 등록
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

    // ------------------ 댓글 액션 핸들러 ------------------

    // 댓글 좋아요 처리
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

    // 댓글 신고 핸들러
    const handleReport = (type, targetId) => {
        if (window.confirm(`${type} (${targetId})를 신고하시겠습니까? 신고 후에는 되돌릴 수 없습니다.`)) {
            // 실제 신고 API 호출 로직은 여기에 추가됩니다.
            alert(`${type} (${targetId})를 신고했습니다. 감사합니다.`);
        }
    };

    // 댓글 수정 모드 토글
    const handleCommentEditToggle = (commentId, content) => {
        if (editingCommentId === commentId) {
            handleCommentEditCancel(); 
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
            // postId를 사용하여 API 호출 (부모 컴포넌트에서 받은 postId)
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

    // 댓글 삭제 (API 연동)
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

    // 댓글 채택 처리 (API 연동)
    const handleCommentAdopt = async (commentId) => {
        // 1. 게시글이 '질문' 타입이고 작성자 본인인지 확인
        if (postSubject !== '질문' || user?.username !== postAuthorUsername) {
            alert('질문 게시글의 작성자만 댓글을 채택할 수 있습니다.');
            return;
        }

        // 2. 이미 채택된 댓글이 있는지 확인
        if (adoptedCommentId) {
             alert('이미 댓글이 채택되었습니다.');
             return;
        }

        if (window.confirm('이 댓글을 채택하시겠습니까? 채택된 댓글은 취소가 불가능할 수 있습니다.')) {
            try {
                // 가정: 채택 API는 /comment/{commentId}/adopt
                await apiClient.post(`/comment/${commentId}/adopt`);
                
                // UI 업데이트: 부모 상태의 adoptedCommentId를 업데이트
                setPostAdoptedId(commentId);
                
            } catch (err) {
                console.error("댓글 채택 오류:", err.response?.data?.message || err.message);
                alert("댓글 채택 중 오류가 발생했습니다: " + (err.response?.data?.message || '알 수 없는 오류'));
            }
        }
    }

    // ------------------ 모임 신청 핸들러 (추가됨) ------------------
    const handleApplicationSubmit = async () => {
        if (!applicationText.trim()) {
            alert("신청 내용을 입력해주세요.");
            return;
        }

        try {
            apiClient.post(`/comment/${postId}/apply-recruitment`, {content: applicationText})

            setApplicationText(''); // 신청 완료 후 필드 초기화
            setIsSavedInRecruitment(true)
        } catch (err) {
            console.error("모임 신청 오류:", err.response?.data?.message || err.message);
            alert("모임 신청 중 오류가 발생했습니다.");
        }
    };


    // 💡 채택된 댓글과 일반 댓글 목록 분리
    const adoptedComment = comments.find(c => c.id === adoptedCommentId);
    const filteredComments = comments.filter(c => c.id !== adoptedCommentId);

    // 질문 게시글의 작성자 여부
    const isQuestionPostAuthor = postSubject === '질문' && user?.username === postAuthorUsername;
    // 채택이 이미 이루어졌는지 여부
    const isSolved = !!adoptedCommentId;
    
    // 모집 게시글 여부 (추가됨)
    const isRecruitPost = postSubject === '모집';


    return (
        <>
        {/* 💡 모임 신청 영역 (수정됨) */}
            {isRecruitPost && (
                <Box sx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                        marginX: theme.spacing(2),
                    },
                })}>
                    {isSavedInRecruitment ? ( // 💡 신청 완료 상태 확인
                        <ApplicationCompleteMessage>
                            <CheckCircleOutlineIcon 
                                sx={{ 
                                    fontSize: 48, 
                                    color: RECRUIT_ACCENT_COLOR, 
                                    mb: 1.5 
                                }} 
                            />
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 700, 
                                    color: RECRUIT_ACCENT_COLOR 
                                }}
                            >
                                신청되었습니다.
                            </Typography>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    mt: 1, 
                                    color: alpha(RECRUIT_ACCENT_COLOR, 0.8) 
                                }}
                            >
                                신청 내용은 작성자에게 전달되었으며, 승인을 기다리고 있습니다.
                            </Typography>
                        </ApplicationCompleteMessage>
                    ) : (
                        // 기존 모임 신청 폼
                        <ApplicationWrapper>
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    fontWeight: 700, 
                                    color: RECRUIT_ACCENT_COLOR, // 💡 새로운 액센트 색상 적용
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
                                        // 💡 TextField 테두리에 새로운 액센트 색상 적용
                                        '& fieldset': { borderColor: alpha(RECRUIT_ACCENT_COLOR, 0.6) }, 
                                        '&:hover fieldset': { borderColor: RECRUIT_ACCENT_COLOR },
                                        '&.Mui-focused fieldset': { borderColor: RECRUIT_ACCENT_COLOR, borderWidth: '2px' }, // 포커스 시 두꺼운 테두리
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
                                        backgroundColor: RECRUIT_ACCENT_COLOR, // 💡 새로운 액센트 색상 적용
                                        fontWeight: 600,
                                        padding: (theme) => theme.spacing(1, 3),
                                        minWidth: '120px',
                                        '&:hover': { backgroundColor: RECRUIT_DARK_COLOR }, // 💡 새로운 진한 색상 적용
                                    }}
                                >
                                    모임 신청
                                </Button>
                            </Box>
                        </ApplicationWrapper>
                    )}
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

            {/* 💡 채택된 댓글 독립적으로 표시 */}
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
                            {/* 💡 채택된 댓글의 날짜 정보 표시 */}
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

            {/* 댓글 입력 영역 */}
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

            {/* 댓글 목록 */}
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
                                            {/* 전체 사용자 대상 액션 그룹 (좋아요, 신고) */}
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

                                            {/* 작성자 대상 액션 그룹 (수정, 삭제) */}
                                            {comment.username === user?.username && (
                                                <Box
                                                    sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2, pl: 2, borderLeft: `1px solid ${alpha(LIGHT_TEXT_COLOR, 0.4)}` }}
                                                >
                                                    {editingCommentId === comment.id ? (
                                                        <>
                                                            {/* 저장 버튼 (Edit -> Save) */}
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
                                                            {/* 취소 버튼 */}
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
                                                                <Edit fontSize="inherit" />
                                                            </IconButton>

                                                            {/* 삭제 버튼 */}
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

                                            {/* 채택 버튼 (질문 게시글의 작성자에게만 표시) */}
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