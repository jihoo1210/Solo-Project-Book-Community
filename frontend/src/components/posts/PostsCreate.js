// src/components/PostsCreate.js

import React, { useState } from 'react';
import { 
    Box, Container, Typography, Button, Paper, Grid, TextField, 
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '../auth/AuthContext';

const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';
const HEADER_HEIGHT = '64px'; 

const CreateWrapper = styled(Box)(({ theme }) => ({
    marginTop: HEADER_HEIGHT, 
    minHeight: `calc(100vh - ${HEADER_HEIGHT} - 150px)`, 
    backgroundColor: BG_COLOR,
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
}));

const CreateCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(5),
    borderRadius: (theme.shape?.borderRadius || 4) * 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: `1px solid ${TEXT_COLOR}`,
    backgroundColor: BG_COLOR,
    width: '100%',
    maxWidth: '800px', 
    
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
}));

const ActionButton = styled(Button)(({ theme }) => ({
    color: BG_COLOR,
    backgroundColor: TEXT_COLOR,
    fontWeight: 600,
    padding: theme.spacing(1, 3), 
    minWidth: '120px',
    '&:hover': { backgroundColor: LIGHT_TEXT_COLOR },
}));

const PostsCreate = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const author = user?.username ? user.username : "사용자명"; 

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
        content: '',
        bookTitle: '',
        pageNumber: '',
        region: '',
        dayInput: '', 
    });

    const showQuestionFields = formData.subject === '질문';
    const showRecruitmentFields = formData.subject === '모집';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 모집 필드 유효성 검사 (dayInput만 체크하도록 수정)
        if (showRecruitmentFields) {
            if (formData.dayInput.trim() === '') {
                alert('모임 날짜(예: 매주 월요일)를 입력해야 합니다.');
                return;
            }
        }
        
        const dataToSubmit = {
            author,
            title: formData.title,
            content: formData.content,
            subject: formData.subject,
            ...(showQuestionFields && { 
                bookTitle: formData.bookTitle, 
                pageNumber: formData.pageNumber 
            }),
            ...(showRecruitmentFields && { 
                region: formData.region, 
                meetingInfo: formData.dayInput,
            }),
        };

        console.log('새 게시글 작성:', dataToSubmit);
        
        navigate('/'); 
    };
    
    const AuthorAndSubjectGrid = (
        <>
            <Grid size={{xs: 6, sm: 3}}>
                <FormControl fullWidth required variant="outlined">
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
            
            <Grid size={{xs: 6, sm: 3}}>
                <CustomTextField
                    fullWidth
                    label="작성자"
                    name="author"
                    value={author} 
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
                required
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
                        required
                    />
                </Grid>
                <Grid size={{xs:12, sm:6}}> 
                    <CustomTextField
                        fullWidth
                        label="페이지 번호"
                        name="pageNumber"
                        value={formData.pageNumber}
                        onChange={handleChange}
                        variant="outlined"
                        required
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
                        required
                    />
                </Grid>
                
                <Grid size={{xs:12}}>
                    <CustomTextField
                        fullWidth
                        label="모임 일정 (예: 매주 토요일 오후 2시)"
                        name="dayInput"
                        value={formData.dayInput}
                        onChange={handleChange}
                        variant="outlined"
                    />
                </Grid>
            </Grid>
        </Grid>
    );


    return (
        <CreateWrapper>
            <Container maxWidth="lg" sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
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
                                <CustomTextField
                                    fullWidth
                                    label="내용"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    variant="outlined"
                                    multiline
                                    rows={15}
                                    required
                                />
                                
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