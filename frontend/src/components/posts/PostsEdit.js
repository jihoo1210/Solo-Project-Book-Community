// src/components/PostsEdit.js

import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Button, Paper, Grid, TextField,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// 🌺 Froala Wysiwyg Editor (react-froala-wysiwyg) Import 추가
import WysiwygEditor from 'react-froala-wysiwyg';

import apiClient from '../../api/Api-Service';

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
    maxWidth: '800px', // PostsCreate.js와 동일하게 maxWidth 추가

    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3),
    },
}));

// PostsCreate.js와 동일한 스타일 재사용
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
            borderColor: `${TEXT_COLOR} !important`, // PostsCreate.js와 동일하게 수정
        },
        '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: TEXT_COLOR, // PostsCreate.js와 동일하게 수정
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


// PostsCreate.js의 DisabledTextField 스타일 재사용
const DisabledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root.Mui-disabled': {
        backgroundColor: alpha(LIGHT_TEXT_COLOR, 0.1), // 배경색 흐리게
        color: TEXT_COLOR,
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


const PostEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // URL에서 게시글 ID를 가져옴

    // API 응답에서 로드될 게시글 정보
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 🌺 Froala Editor 내용 상태
    const [contentHtml, setContentHtml] = useState('');

    // 유효성 검사 에러 상태 추가
    const [fieldErrors, setFieldErrors] = useState({});

    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    // 1. 초기 데이터 로딩 (API 호출)
    useEffect(() => {
        setIsLoading(true)
        const fetchPostDetails = async () => {
            try {
                const response = await apiClient.get(`/posts/${id}`)
                const postData = response.data.result

                if(postData) {

                    setPost(postData);
                    console.log(postData)
                    // 🌺 Froala Editor 상태 초기화
                    setContentHtml(postData.content || ''); // API에서 받은 content로 에디터 초기화
                }
            } catch (error) {
                console.error("게시글 로딩 실패:", error);
                setPost(null);
                // 에디터 내용도 초기화
                setContentHtml('');
            } finally {
                setIsLoading(false)
            }
        };
        fetchPostDetails()
    }, [id]);

    // Editor 내용 변경 핸들러 (PostsCreate.js 참조)
    const onContentChange = (newHtml) => {
        setContentHtml(newHtml);
        // 내용이 입력되면 에러를 바로 해제
        if (newHtml.replace(/(<([^>]+)>)/gi, "").trim() !== '') {
            setFieldErrors(prev => ({ ...prev, content: undefined }));
        }
    };

    // API 응답 기반 변수 준비 (post가 로드되지 않았을 경우를 대비)
    const author = post ? post.username : '불러오는 중...'; // API 응답의 writer 필드 사용
    const currentDateTimeText = post ? `${getCurrentDateTime()}` : '정보 없음';

    if (isLoading || !post) { // postData가 없을 때도 로딩 화면 표시
        return (
            <CreateWrapper>
                <Container maxWidth="lg">
                    <Typography variant="h5" align="center" color={LIGHT_TEXT_COLOR}>게시글을 불러오는 중...</Typography>
                </Container>
            </CreateWrapper>
        );
    }

    // 게시글 유형에 따라 동적으로 필드 표시
    const showQuestionFields = post.subject === '질문';
    const showRecruitmentFields = post.subject === '모집';

    const handleChange = (e) => {
        let { name, value } = e.target;
        
        // posts 상태를 임시로 저장
        const prevPost = post;

        // PostsCreate.js와 동일하게 pageNumber에 숫자만 허용
        if(name === 'pageNumber') {
            value = value.replace(/[^0-9]/g, '')
        }

        // subject가 변경되면, subject 외의 조건부 필드 초기화
        if (name === 'subject') {
            
            // 🌟 추가: Subject가 변경되는 경우에만 경고 alert 표시
            if (prevPost.subject !== value) {
                if (!window.confirm('정말 게시글 종류를 바꾸시겠습니까?')) {
                    // 사용자가 취소를 누르면, 변경을 막고 기존 상태를 유지
                    e.preventDefault();
                    return;
                }
            }

            setPost({
                ...prevPost,
                subject: value,
                // subject가 변경될 때, 조건부 필드 초기화
                bookTitle: '',
                pageNumber: '',
                region: '',
                meetingInfo: '',
            });
            // 🌟 삭제: Select 항목이 선택되면 경고 메시지 비활성화 로직 제거

        } else {
            setPost(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // 값이 입력되면 에러를 바로 해제 (PostsCreate.js 참조)
        if (value.trim() !== '') {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleUpdate = async (e) => { // async 유지
        e.preventDefault();

        let errors = {};
        let hasError = false;

        // 유효성 검사 시작 (PostsCreate.js 로직 참고)

        // 1. 제목 (Title)
        if (post.title.trim() === '') {
            errors.title = '게시글 제목을 입력해야 합니다.';
            hasError = true;
        }

        // 2. 내용 (Content - Froala Editor)
        const strippedContent = contentHtml.replace(/(<([^>]+)>)/gi, "").trim();
        if (!strippedContent) {
            errors.content = '내용을 입력해야 합니다.';
            hasError = true;
        }

        // 3. 질문 필드 유효성 검사
        if (showQuestionFields) {
            if (post.bookTitle.trim() === '') {
                errors.bookTitle = '책 제목을 입력해야 합니다.';
                hasError = true;
            }
            if (post.pageNumber === '') {
                errors.pageNumber = '페이지 번호를 입력해야 합니다.';
                hasError = true;
            }
        }

        // 4. 모집 필드 유효성 검사
        if (showRecruitmentFields) {
            if (post.region.trim() === '') {
                errors.region = '모임 지역을 입력해야 합니다.';
                hasError = true;
            }
            if (post.meetingInfo.trim() === '') {
                errors.meetingInfo = '모임 일정을 입력해야 합니다.';
                hasError = true;
            }
        }

        // 에러 상태 업데이트
        setFieldErrors(errors);

        if (hasError) {
            return; // 에러가 있으면 제출 방지
        }
        // 유효성 검사 끝

        if (window.confirm('게시글을 수정하시겠습니까?')) {

            const dataToUpdate = {
                id: id,
                subject: post.subject,
                title: post.title,
                content: contentHtml, // 🌺 contentHtml 사용
                // ... (조건별 필드 추가 로직)
                ...(showQuestionFields && {
                    bookTitle: post.bookTitle,
                    pageNumber: post.pageNumber
                }),
                ...(showRecruitmentFields && {
                    region: post.region,
                    meetingInfo: post.meetingInfo, // dayInput을 meetingInfo로 매핑
                }),
            };

            try {
                // 실제 API 호출 로직: updatePost(id, dataToUpdate)
                await apiClient.patch(`/posts/${id}`, dataToUpdate);
                alert("게시글을 성공적으로 수정했습니다.");
                navigate(`/post/${id}`); // 수정 완료 후 상세 페이지로 이동
            } catch (error) {
                console.error("게시글 수정 실패:", error);
                const message = error.response?.data?.result?.message || "게시글 수정에 실패했습니다. 다시 시도해 주세요.";
                alert(message);
            }
        }
    };

    // UI 구조는 PostCreate.js와 동일하게 유지
    const AuthorAndSubjectGrid = (
        <>
            <Grid size={{xs:6, sm: 3}}>
                <FormControl fullWidth variant="outlined"> {/* required 제거 (Custom Validation으로 대체) */}
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
                        value={post.subject} // post 상태 사용
                        onChange={handleChange}
                        // onOpen={handleSubjectOpen} // 🌟 삭제: Select 메뉴 클릭 시 경고 표시 로직 제거
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
                    <Typography
                        color="error" // 붉은색 인라인 글씨
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5, fontSize: '0.7rem', fontWeight: 600 }}
                    >
                        주의! 게시글의 종류를 바꾸면 이전의 내용과 제목을 제외한 모든 정보가 초기화 됩니다.
                    </Typography>
            </Grid>

            <Grid size={{xs:6, sm:3}}>
                <DisabledTextField // PostsCreate.js의 스타일을 적용한 DisabledTextField 사용
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
        <Grid size={{xs:12}}>
            <CustomTextField
                fullWidth
                label="게시글 제목"
                name="title"
                value={post.title} // post 상태 사용
                onChange={handleChange}
                variant="outlined"
                // ❌ required 제거
                error={!!fieldErrors.title} // 에러 상태 바인딩
                helperText={fieldErrors.title} // 에러 메시지 바인딩
            />
        </Grid>
    );

    // 질문 게시글용 추가 필드
    const QuestionFields = (
        <Grid size={{xs:12}}>
            <Grid container spacing={3}>
                <Grid size={{xs:12, sm:6}}>
                    <CustomTextField
                        fullWidth
                        label="책 제목"
                        name="bookTitle"
                        value={post.bookTitle} // post 상태 사용
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
                        label="페이지 번호"
                        name="pageNumber"
                        value={post.pageNumber} // post 상태 사용
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

    // 모집 게시글용 추가 필드
    const RecruitmentFields = (
        <Grid size={{xs:12}}>
            <Grid container spacing={3}>
                <Grid size={{xs:12}}>
                    <CustomTextField
                        fullWidth
                        label="지역"
                        name="region"
                        value={post.region} // post 상태 사용
                        onChange={handleChange}
                        variant="outlined"
                        // ❌ required 제거
                        error={!!fieldErrors.region} // 에러 상태 바인딩
                        helperText={fieldErrors.region} // 에러 메시지 바인딩
                    />
                </Grid>

                <Grid size={{xs:12}}>
                    <CustomTextField
                        fullWidth
                        label="모임 일정 (예: 매주 토요일 오후 2시)"
                        name="meetingInfo"
                        value={post.meetingInfo} // post 상태 사용
                        onChange={handleChange}
                        variant="outlined"
                        // ❌ required 제거
                        error={!!fieldErrors.meetingInfo} // 에러 상태 바인딩
                        helperText={fieldErrors.meetingInfo} // 에러 메시지 바인딩
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

                            <Grid size={{xs:12}}>
                                <InputLabel
                                    sx={{
                                        // 에러 상태에 따라 텍스트 색상 변경 (PostsCreate.js 참조)
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

                                {/* 🌺 Froala Wysiwyg Editor 컴포넌트 적용 및 MUI 디자인 맞춤 (PostsCreate.js 참조) */}
                                <Box sx={{
                                    border: `1px solid ${TEXT_COLOR}`, // MUI TextField처럼 Box에 테두리 적용
                                    borderRadius: '4px',
                                    // 에러 상태일 때 테두리 색상을 빨간색으로 변경
                                    borderColor: fieldErrors.content ? 'error.main' : TEXT_COLOR,
                                    '& .fr-box': {
                                        border: 'none !important',
                                        backgroundColor: BG_COLOR,
                                    },
                                    '& .fr-box.fr-basic .fr-wrapper': {
                                        minHeight: '400px',
                                    },
                                    '& .fr-wrapper.show-placeholder': {
                                        border: 'none !important',
                                    },
                                    '& .fr-second-toolbar': {
                                        border: 'none !important',
                                    },
                                    '& .fr-toolbar': {
                                        backgroundColor: BG_COLOR,
                                        border: 'none !important',
                                    },
                                    '& .fr-wrapper': {
                                        border: 'none !important'
                                    }
                                }}>
                                    <WysiwygEditor
                                        model={contentHtml}
                                        onModelChange={onContentChange}
                                        config={{
                                            placeholderText: '내용을 입력하세요...',
                                            attribution: false,
                                            heightMin: 400,
                                            theme: 'default',
                                            // language: 'ko',
                                            toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', '|',
                                                'fontSize', '|',
                                                'align',
                                                'formatOL', 'formatUL', '|',
                                                'insertLink', '|',
                                                'textColor', 'backgroundColor', '|',
                                                'undo', 'redo', '|'
                                            ],
                                        }}
                                    />
                                </Box>

                                {/* 에디터 에러 메시지 표시 (PostsCreate.js 참조) */}
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