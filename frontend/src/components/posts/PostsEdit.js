// src/components/PostsEdit.js

import React, { useState, useEffect } from 'react';
import { 
    Box, Container, Typography, Button, Paper, Grid, TextField, 
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '../auth/AuthContext';

// 색상 정의 (기존 파일들과 일관성 유지)
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';
const HEADER_HEIGHT = '64px'; 

// PostCreate.js와 동일한 스타일 재사용
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
        // disabled 상태의 스타일 추가: 수정 페이지에서 subject, writer 등에 사용됨
        '&.Mui-disabled fieldset': { 
            borderColor: `${LIGHT_TEXT_COLOR} !important`,
        },
        '& .MuiInputBase-input.Mui-disabled': { 
            WebkitTextFillColor: LIGHT_TEXT_COLOR, 
            cursor: 'not-allowed', 
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

// Mock Data: 수정할 게시글의 초기값 (모집 게시글 예시)
const initialMockPost = { 
    id: 10, 
    subject: '모집', // 화면 표시를 위해 한글로 가정
    title: '사이드 프로젝트 함께 할 프론트엔드 개발자 모집 (수정 중)', 
    writer: '프로젝트C', 
    content: `안녕하세요, 사이드 프로젝트 팀원 모집 글을 수정합니다.
    Next.js와 Typescript 기반의 소셜 미디어 서비스를 개발하고 있습니다.
    함께 성장하고 포트폴리오를 만들 분을 찾습니다.`,
    region: '온라인/서울 강남', 
    dayInput: '매주 토요일 오후 2시', // meetingInfo
    bookTitle: '', 
    pageNumber: '',
    modifiedDate: '2025-11-04 15:30',
};


const PostEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // URL에서 게시글 ID를 가져옴
    const { user } = useAuth();
    
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        subject: '',
        title: '',
        content: '',
        bookTitle: '',
        pageNumber: '',
        region: '',
        dayInput: '', 
    });

    // 1. 초기 데이터 로딩 (Mock Data 사용)
    useEffect(() => {
        // 실제로는 API 호출: fetchPost(id).then(data => setFormData(data))
        
        // Mock Data를 사용하여 formData 초기화
        setFormData({
            subject: initialMockPost.subject,
            title: initialMockPost.title,
            content: initialMockPost.content,
            bookTitle: initialMockPost.bookTitle || '',
            pageNumber: initialMockPost.pageNumber || '',
            region: initialMockPost.region || '',
            dayInput: initialMockPost.dayInput || '',
        });
        setIsLoading(false);
    }, [id]); 

    if (isLoading) {
        return (
            <CreateWrapper>
                <Container maxWidth="lg">
                    <Typography variant="h5" align="center" color={LIGHT_TEXT_COLOR}>게시글을 불러오는 중...</Typography>
                </Container>
            </CreateWrapper>
        );
    }

    const author = initialMockPost.writer; 
    const currentDateTimeText = `마지막 수정: ${initialMockPost.modifiedDate}`;

    // 게시글 유형에 따라 동적으로 필드 표시
    const showQuestionFields = formData.subject === '질문';
    const showRecruitmentFields = formData.subject === '모집';

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // subject가 변경되면, subject 외의 조건부 필드 초기화
        if (name === 'subject') {
            setFormData({
                ...formData,
                subject: value,
                // subject가 변경될 때, 조건부 필드 초기화
                bookTitle: '',
                pageNumber: '',
                region: '',
                dayInput: '',
            });
        } else {
            setFormData(prev => ({ 
                ...prev, 
                [name]: value 
            }));
        }
    };
    
    const handleUpdate = (e) => {
        e.preventDefault();
        
        // 모집 필드 유효성 검사 (dayInput만 체크하도록 수정 - PostCreate.js 참조)
        if (showRecruitmentFields) {
            if (formData.dayInput.trim() === '') {
                alert('모임 일정(예: 매주 월요일)을 입력해야 합니다.');
                return;
            }
        }
        
        if (window.confirm('게시글을 수정하시겠습니까?')) {
            
            // 1. 한글 subject를 영문 Enum 이름으로 매핑 (PostCreate.js와 동일)
            const subjectMap = {
                '질문': 'QUESTION',
                '공유': 'SHARE', 
                '모집': 'RECRUIT'
            };
            const actualSubject = subjectMap[formData.subject];

            const dataToUpdate = {
                id: id,
                subject: actualSubject,
                title: formData.title,
                content: formData.content,
                // ... (조건별 필드 추가 로직)
                ...(showQuestionFields && { 
                    bookTitle: formData.bookTitle, 
                    pageNumber: formData.pageNumber 
                }),
                ...(showRecruitmentFields && { 
                    region: formData.region, 
                    meetingInfo: formData.dayInput,
                }),
            };

            console.log(`게시글 ${id} 수정 완료:`, dataToUpdate);
            
            // 실제 API 호출 로직: updatePost(id, dataToUpdate)
            
            navigate(`/posts/${id}`); // 수정 완료 후 상세 페이지로 이동
        }
    };
    
    // UI 구조는 PostCreate.js와 동일하게 유지
    const AuthorAndSubjectGrid = (
        <>
            <Grid  size={{xs:6}} sm={3}>
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
                        onChange={handleChange} // disabled 제거 및 onChange 연결
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
            
            <Grid  size={{xs:6}} sm={3}>
                <CustomTextField
                    fullWidth
                    label="작성자"
                    name="author"
                    value={author} 
                    variant="outlined"
                    disabled // 작성자는 수정 불가
                />
            </Grid>
        </>
    );

    const TitleGrid = (
        <Grid  size={{xs:12}}>
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
    
    // 질문 게시글용 추가 필드
    const QuestionFields = (
        <Grid  size={{xs:12}}>
            <Grid container spacing={3}>
                <Grid  size={{xs:12}} sm={6}> 
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
                <Grid  size={{xs:12}} sm={6}> 
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

    // 모집 게시글용 추가 필드
    const RecruitmentFields = (
        <Grid  size={{xs:12}}>
            <Grid container spacing={3}>
                <Grid  size={{xs:12}}>
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
                
                <Grid  size={{xs:12}}>
                    <CustomTextField
                        fullWidth
                        label="모임 일정 (예: 매주 토요일 오후 2시)"
                        name="dayInput"
                        value={formData.dayInput}
                        onChange={handleChange}
                        variant="outlined"
                        required
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
                        게시글 수정 (ID: {id})
                    </Typography>

                    <form onSubmit={handleUpdate}>
                        <Grid container spacing={3}>
                            
                            {/* 게시판 선택 필드를 활성화하고 작성자 필드와 함께 배치 */}
                            {AuthorAndSubjectGrid}

                            {TitleGrid}

                            {/* 게시글 타입에 따라 동적으로 필드 렌더링 */}
                            {showQuestionFields && QuestionFields}

                            {showRecruitmentFields && RecruitmentFields}

                            <Grid  size={{xs:12}}>
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

                            <Grid  size={{xs:12}}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                    <Button 
                                        variant="outlined" 
                                        component={Link} 
                                        to={`/post/${id}`} // 상세 페이지로 돌아가기
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
                                        수정 완료
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

export default PostEdit;