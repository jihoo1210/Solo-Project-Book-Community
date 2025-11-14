// src/components/PostsCreate.js

import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Button, Paper, Grid, TextField,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// 🚀 Tiptap Editor Import로 교체
import TiptapEditor from '../utilities/TiptabEditor'; // TiptapEditor 컴포넌트를 이 파일에 추가하거나 별도 파일에서 import

import { useAuth } from '../auth/AuthContext';
import apiClient from '../../api/Api-Service';

const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';
const HEADER_HEIGHT = '64px';

// (CreateWrapper, CreateCard, CustomTextField, ActionButton, DisabledTextField 스타일 정의는 동일하게 유지)
// ... (기존 스타일 코드)

const CreateWrapper = styled(Box)(({ theme }) => ({
    marginTop: HEADER_HEIGHT,
    backgroundColor: BG_COLOR,
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
}));

const CreateCard = styled(Paper)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(5),
    borderRadius: (theme.shape?.borderRadius || 4) * 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: `1px solid ${TEXT_COLOR}`,
    backgroundColor: BG_COLOR,

    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3),
    },
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-root': {
        color: LIGHT_TEXT_COLOR,
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: TEXT_COLOR,
        },
        '&:hover fieldset': {
            borderColor: TEXT_COLOR,
        },
        '&.Mui-focused fieldset': {
            borderColor: TEXT_COLOR,
            borderWidth: '1px',
        },
        '&.Mui-disabled fieldset': {
            borderColor: `${TEXT_COLOR} !important`,
        },
        '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: TEXT_COLOR,
        },
    },
    '& .MuiInputLabel-root.Mui-disabled': {
        color: `${LIGHT_TEXT_COLOR} !important`,
    },
    // 에러 상태일 때 label 색상 변경
    '& .MuiInputLabel-root.Mui-error': {
        color: `${theme.palette.error.main} !important`,
    }
}));

const ActionButton = styled(Button)(({ theme }) => ({
    color: BG_COLOR,
    backgroundColor: TEXT_COLOR,
    fontWeight: 600,
    padding: theme.spacing(1, 3),
    minWidth: '120px',
    '&:hover': { backgroundColor: LIGHT_TEXT_COLOR },
}));

const DisabledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root.Mui-disabled': {
        backgroundColor: alpha(LIGHT_TEXT_COLOR, 0.1), // 배경색 흐리게
        color: TEXT_COLOR,
    },
}));


const PostsCreate = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // 유효성 검사 에러 상태 추가
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        return () => {
            // (필요 시 언마운트 시점에 필요한 정리 코드를 여기에 추가)
        };
    }, []);


    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    const currentDateTimeText = getCurrentDateTime();

    const [formData, setFormData] = useState({
        subject: '공유',
        title: '',
        bookTitle: '',
        pageNumber: '',
        region: '',
        dayInput: '',
        maxUserNumber: '', // <<<<<<< 모집 인원수 필드 추가
    });

    // 🚀 Tiptap Editor는 HTML 문자열로 콘텐츠를 관리합니다.
    const [contentHtml, setContentHtml] = useState('');

    // Editor 내용 변경 핸들러
    const onContentChange = (newHtml) => {
        setContentHtml(newHtml);
        // 내용이 입력되면 에러를 바로 해제 (HTML 태그 제거 후 빈 문자열인지 확인)
        const strippedContent = newHtml.replace(/(<([^>]+)>)/gi, "").trim();
        if (strippedContent !== '') {
            setFieldErrors(prev => ({ ...prev, content: undefined }));
        }
    };


    const showQuestionFields = formData.subject === '질문';
    const showRecruitmentFields = formData.subject === '모집';

    const handleChange = (e) => {
        let { name, value } = e.target;

        // ❌ pageNumber와 maxUserNumber에 숫자만 허용하도록 수정
        if(name === 'pageNumber' || name === 'maxUserNumber') {
            value = value.replace(/[^0-9]/g, '')
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // 값이 입력되면 에러를 바로 해제
        if (value.trim() !== '') {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let errors = {};
        let hasError = false;

        // 유효성 검사 시작 (required 속성 대체)
        
        // 1. 제목 (Title)
        if (formData.title.trim() === '') {
            errors.title = '게시글 제목을 입력해야 합니다.';
            hasError = true;
        }

        // 2. 내용 (Content - Tiptap Editor)
        const strippedContent = contentHtml.replace(/(<([^>]+)>)/gi, "").trim();
        if (!strippedContent) {
            errors.content = '내용을 입력해야 합니다.';
            hasError = true;
        }

        // 3. 질문 필드 유효성 검사
        if (showQuestionFields) {
            if (formData.bookTitle.trim() === '') {
                errors.bookTitle = '책 제목을 입력해야 합니다.';
                hasError = true;
            }
            if (formData.pageNumber.trim() === '') {
                errors.pageNumber = '페이지 번호를 입력해야 합니다.';
                hasError = true;
            }
        }

        // 4. 모집 필드 유효성 검사
        if (showRecruitmentFields) {
            if (formData.region.trim() === '') {
                errors.region = '모임 지역을 입력해야 합니다.';
                hasError = true;
            }
            if (formData.dayInput.trim() === '') {
                errors.dayInput = '모임 일정을 입력해야 합니다.';
                hasError = true;
            }
            // ❌ 모집 인원수 유효성 검사 추가
            if (formData.maxUserNumber.trim() === '' || parseInt(formData.maxUserNumber) <= 0) {
                errors.maxUserNumber = '모집 인원수를 1명 이상 입력해야 합니다.';
                hasError = true;
            }
        }

        // 에러 상태 업데이트
        setFieldErrors(errors);

        if (hasError) {
            return; // 에러가 있으면 제출 방지
        }
        // 유효성 검사 끝

        const dataToSubmit = {
            title: formData.title,
            content: contentHtml, 
            subject: formData.subject,
            ...(showQuestionFields && { 
                bookTitle: formData.bookTitle, 
                pageNumber: formData.pageNumber 
            }),
            ...(showRecruitmentFields && { 
                region: formData.region, 
                meetingInfo: formData.dayInput,
                maxUserNumber: formData.maxUserNumber, // <<<<<<< 모집 인원수 데이터 추가
            }),
        };
        
        apiClient.post("/posts", dataToSubmit).then(response => {
                navigate('/');
        })
        .catch(error => {
            console.log('error.response.data.message', error)
            if(error.response.data.message) {
                alert(error.response.data.message)
                return;
            }
        })
    };

    // (AuthorAndSubjectGrid, TitleGrid, QuestionFields 컴포넌트는 동일하게 유지)
    
    const AuthorAndSubjectGrid = (
        <>
            <Grid size={{xs:12, sm:6}}>
                <FormControl fullWidth variant="outlined"> 
                    <InputLabel 
                        id="subject-label" 
                        sx={{ color: LIGHT_TEXT_COLOR }}
                    >
                        게시판
                    </InputLabel>
                    <Select
                        labelId="subject-label"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        label="게시판"
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: TEXT_COLOR },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: TEXT_COLOR },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: TEXT_COLOR, borderWidth: '1px' },
                            color: TEXT_COLOR
                        }}
                    >
                        <MenuItem value={'질문'}>질문</MenuItem>
                        <MenuItem value={'공유'}>공유</MenuItem>
                        <MenuItem value={'모집'}>모집</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid size={{xs:12, sm:6}}>
                <DisabledTextField
                    fullWidth
                    label="작성자"
                    value={user ? user.username : "로그인 필요"}
                    variant="outlined"
                    disabled
                />
            </Grid>
        </>
    );

    const TitleGrid = (
        <Grid size={{xs:12}}>
            <CustomTextField
                fullWidth
                label="게시글 제목"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
                // ❌ required 제거
                error={!!fieldErrors.title} // 에러 상태 바인딩
                helperText={fieldErrors.title} // 에러 메시지 바인딩
            />
        </Grid>
    );

    const QuestionFields = (
        <Grid size={{xs:12}}>
            <Grid container spacing={3}>
                <Grid size={{xs:12, sm:6}}>
                    <CustomTextField
                        fullWidth
                        label="책 제목"
                        name="bookTitle"
                        value={formData.bookTitle}
                        onChange={handleChange}
                        variant="outlined"
                        // ❌ required 제거
                        error={!!fieldErrors.bookTitle} // 에러 상태 바인딩
                        helperText={fieldErrors.bookTitle} // 에러 메시지 바인딩
                    />
                </Grid>
                <Grid size={{xs:12, sm:6}}>
                    <CustomTextField
                        fullWidth
                        label="페이지 번호 (숫자만)"
                        name="pageNumber"
                        value={formData.pageNumber}
                        onChange={handleChange}
                        variant="outlined"
                        // ❌ required 제거
                        error={!!fieldErrors.pageNumber} // 에러 상태 바인딩
                        helperText={fieldErrors.pageNumber} // 에러 메시지 바인딩
                    />
                </Grid>
            </Grid>
        </Grid>
    );

    const RecruitmentFields = (
        <Grid size={{xs:12}}>
            <Grid container spacing={3}>
                <Grid size={{xs:12}}>
                    <CustomTextField
                        fullWidth
                        label="지역"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        variant="outlined"
                        // ❌ required 제거
                        error={!!fieldErrors.region} // 에러 상태 바인딩
                        helperText={fieldErrors.region} // 에러 메시지 바인딩
                    />
                </Grid>

                {/* ❌ 모임 일정 Grid size 수정 */}
                <Grid size={{xs:12, sm:9}}> 
                    <CustomTextField
                        fullWidth
                        label="모임 일정 (예: 매주 토요일 오후 2시)"
                        name="dayInput"
                        value={formData.dayInput}
                        onChange={handleChange}
                        variant="outlined"
                        // ❌ required 제거
                        error={!!fieldErrors.dayInput} // 에러 상태 바인딩
                        helperText={fieldErrors.dayInput} // 에러 메시지 바인딩
                    />
                </Grid>

                {/* ❌ 모집 인원수 필드 추가 */}
                <Grid size={{xs:12, sm:3}}>
                    <CustomTextField
                        fullWidth
                        label="모집 인원수 (숫자만)"
                        name="maxUserNumber"
                        value={formData.maxUserNumber}
                        onChange={handleChange}
                        variant="outlined"
                        slotProps= {{
                            input: {
                                inputMode: 'numeric', pattern: '[0-9]*' 
                            }
                        }} // 숫자만 입력되도록 힌트 추가
                        error={!!fieldErrors.maxUserNumber} // 에러 상태 바인딩
                        helperText={fieldErrors.maxUserNumber} // 에러 메시지 바인딩
                    />
                </Grid>
            </Grid>
        </Grid>
    );


    return (
        <CreateWrapper>
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CreateCard elevation={0}>
                    <Typography
                        variant="h5"
                        align="left"
                        gutterBottom
                        sx={{ fontWeight: 700, mb: 4, color: TEXT_COLOR }}
                    >
                        새 게시글 작성
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>

                            {AuthorAndSubjectGrid}

                            {TitleGrid}

                            {showQuestionFields && QuestionFields}

                            {showRecruitmentFields && RecruitmentFields}

                            <Grid size={{xs:12}}>

                                <InputLabel
                                    sx={{
                                        // 에러 상태에 따라 텍스트 색상 변경
                                        color: fieldErrors.content ? 'error.main' : LIGHT_TEXT_COLOR,
                                        position: 'relative',
                                        transform: 'none',
                                        marginBottom: '8px',
                                        fontSize: '1rem',
                                        fontWeight: 400
                                    }}
                                >
                                    내용
                                </InputLabel>

                                {/* 🚀 TiptapEditor 컴포넌트로 교체 */}
                                <TiptapEditor
                                    initialContent={contentHtml}
                                    onContentChange={onContentChange}
                                    placeholderText="내용을 입력하세요..."
                                    error={!!fieldErrors.content} // 에러 상태 전달
                                />
                                
                                {/* 에디터 에러 메시지 표시 */}
                                {fieldErrors.content && (
                                    <Typography 
                                        color="error" 
                                        variant="caption" 
                                        display="block"
                                        sx={{ mt: 0.5 }}
                                    >
                                        {fieldErrors.content}
                                    </Typography>
                                )}

                                <Typography
                                    variant="caption"
                                    align="right"
                                    display="block"
                                    sx={{
                                        mt: 0.5,
                                        color: LIGHT_TEXT_COLOR,
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {currentDateTimeText}
                                </Typography>
                            </Grid>

                            <Grid size={{xs:12}}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        component={Link}
                                        to="/"
                                        startIcon={<ArrowBackIcon />}
                                        sx={{
                                            color: TEXT_COLOR,
                                            borderColor: TEXT_COLOR,
                                            fontWeight: 600,
                                            '&:hover': {
                                                borderColor: TEXT_COLOR,
                                                backgroundColor: alpha(TEXT_COLOR, 0.05),
                                            }
                                        }}
                                    >
                                        취소
                                    </Button>
                                    <ActionButton
                                        type="submit"
                                        variant="contained"
                                    >
                                        작성 완료
                                    </ActionButton>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </CreateCard>
            </Container>
        </CreateWrapper>
    );
};

export default PostsCreate;