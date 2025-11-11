import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, TextField, Button, Grid, Paper,
    IconButton, InputAdornment, FormControl, InputLabel, OutlinedInput
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import apiClient from '../../api/Api-Service';
import { useAuth } from './AuthContext';

// 색상 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';

const HEADER_HEIGHT = '64px';

// 레이아웃 래퍼
const SigninWrapper = styled(Box)(({ theme }) => ({
    marginTop: HEADER_HEIGHT,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_COLOR,
    padding: theme.spacing(4),
}));

// 카드 컨테이너
const SigninCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(5),
    width: '60%',
    borderRadius: (theme.shape?.borderRadius || 4) * 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: `1px solid ${TEXT_COLOR}`,
    [theme.breakpoints.down('sm')]: {
        width: "80%",
        padding: theme.spacing(3),
    },
}));

// 텍스트 필드 스타일
const CustomTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-root': { color: LIGHT_TEXT_COLOR },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: TEXT_COLOR },
        '&:hover fieldset': { borderColor: TEXT_COLOR },
        '&.Mui-focused fieldset': {
            borderColor: TEXT_COLOR,
            borderWidth: '1px',
        },
    },
}));

// 로그인 버튼
const ActionButton = styled(Button)(({ theme }) => ({
    color: BG_COLOR,
    backgroundColor: TEXT_COLOR,
    fontWeight: 600,
    padding: theme.spacing(1.5),
    '&:hover': { backgroundColor: LIGHT_TEXT_COLOR },
}));

const SignIn = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const {login} = useAuth();
    const navigate = useNavigate();

    // URL 파라미터에서 이메일 추출하여 폼 데이터에 설정
    useEffect(() => {
      const urlParams = new window.URLSearchParams(window.location.search)
      const email = urlParams.get('email');
      if(email) setFormData(prev => ({...prev, email: email}))
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;

        const newValue = value.replace(/\s/g, '');

        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleClickShowPassword = () => setShowPassword((s) => !s);

    // 로그인 API 요청 처리
    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log('로그인 요청 데이터:', formData);
        apiClient.post("/auth/signin", formData).then(response => {
          // 토큰을 세션 스토리지에 저장
            login(response.data.result.username) // AuthContext의 login 함수 호출
            navigate("/")
        }).catch(error => {
          if(error.response.data.message) alert(error.response.data.message || '예상하지 못한 에러.')
        })
    };

    return (
        <SigninWrapper>
            <Container maxWidth="md" disableGutters sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <SigninCard elevation={0}>
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            mb: 4,
                            color: TEXT_COLOR,
                            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.4rem' },
                        }}
                    >
                        로그인
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Grid container spacing={3}>
                            
                            {/* 이메일 입력 필드 */}
                            <Grid size={{ xs: 12 }}>
                                <CustomTextField
                                    fullWidth
                                    label="이메일"
                                    name="email"
                                    type="text"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            {/* 비밀번호 입력 필드 */}
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth variant="outlined" required>
                                    <InputLabel sx={{ color: LIGHT_TEXT_COLOR }}>비밀번호</InputLabel>
                                    <OutlinedInput
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        label="비밀번호"
                                        sx={{
                                            '& fieldset': { borderColor: TEXT_COLOR },
                                            '&:hover fieldset': { borderColor: TEXT_COLOR },
                                            '&.Mui-focused fieldset': {
                                                borderColor: TEXT_COLOR,
                                                borderWidth: '1px',
                                            },
                                        }}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClickShowPassword} edge="end">
                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                            </Grid>

                            {/* 로그인 제출 버튼 */}
                            <Grid size={{ xs: 12 }}>
                                <ActionButton type="submit" fullWidth variant="contained">
                                    로그인
                                </ActionButton>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* 회원가입 페이지 링크 */}
                    <Typography
                        variant="body2"
                        align="center"
                        sx={{
                            mt: 3,
                            color: LIGHT_TEXT_COLOR,
                            fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        }}
                    >
                        계정이 없으신가요?
                        <Link to="/auth/signup" style={{ textDecoration: 'none' }}>
                            <Box
                                component="span"
                                sx={{ ml: 1, color: TEXT_COLOR, fontWeight: 600 }}
                            >
                                회원가입
                            </Box>
                        </Link>
                    </Typography>

                </SigninCard>
            </Container>
        </SigninWrapper>
    );
};

export default SignIn;