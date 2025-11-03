import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, TextField, Button, Grid, Paper,
    IconButton, InputAdornment, FormControl, InputLabel, OutlinedInput
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import apiClient from '../../api/Api-Service';
import { useAuth } from './AuthContext';

// 🎨 회원가입 페이지와 동일한 디자인 변수 및 스타일 재사용

// 색상 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';

const HEADER_HEIGHT = '64px';

// 1. 레이아웃 래퍼
const SigninWrapper = styled(Box)(({ theme }) => ({
    // 회원가입 페이지의 SignupWrapper와 동일한 스타일 적용
    marginTop: HEADER_HEIGHT,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_COLOR,
    padding: theme.spacing(4),
}));

// 2. 카드 컨테이너
const SigninCard = styled(Paper)(({ theme }) => ({
    // 회원가입 페이지의 SignupCard와 동일한 스타일 적용
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

// 3. 텍스트 필드 스타일
const CustomTextField = styled(TextField)(({ theme }) => ({
    // 회원가입 페이지의 CustomTextField와 동일한 스타일 적용
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

// 4. 로그인 버튼 (회원가입의 ActionButton과 동일)
const ActionButton = styled(Button)(({ theme }) => ({
    // 회원가입 페이지의 ActionButton과 동일한 스타일 적용
    color: BG_COLOR,
    backgroundColor: TEXT_COLOR,
    fontWeight: 600,
    padding: theme.spacing(1.5),
    '&:hover': { backgroundColor: LIGHT_TEXT_COLOR },
}));

// 중복 검사 버튼은 로그인 페이지에서 사용되지 않으므로 정의하지 않습니다.

const SignIn = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const {login} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      const urlParams = new window.URLSearchParams(window.location.search)
      const email = urlParams.get('email');
      if(email) setFormData(prev => ({...prev, email: email}))
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleClickShowPassword = () => setShowPassword((s) => !s);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log('로그인 요청 데이터:', formData);
        apiClient.post("/auth/signin", formData).then(response => {
          if(response.data.result.token) sessionStorage.setItem("ACCESS_TOKEN", response.data.result.token)
            login()
            alert("로그인 되었습니다.")
            navigate("/")
        }).catch(error => {
          if(error.response?.data?.message || error.response?.data || error.response) console.log('error.response.data.message', error.response.data.message)
        })
    };

    return (
        <SigninWrapper>
            {/* Container의 maxWidth="md" 유지 */}
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
                            // 회원가입 페이지와 동일한 반응형 폰트 사이즈
                            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.4rem' },
                        }}
                    >
                        로그인
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        {/* Grid container와 spacing={3} 유지 */}
                        <Grid container spacing={3}>
                            
                            {/* 1. 회원명 (email) - size={{ xs: 12 }} 속성 유지 */}
                            <Grid item size={{ xs: 12 }}>
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

                            {/* 2. 비밀번호 (Password) - size={{ xs: 12 }} 속성 유지 */}
                            <Grid item size={{ xs: 12 }}>
                                <FormControl fullWidth variant="outlined" required>
                                    <InputLabel sx={{ color: LIGHT_TEXT_COLOR }}>비밀번호</InputLabel>
                                    <OutlinedInput
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        label="비밀번호"
                                        sx={{
                                            // CustomTextField와 동일한 디자인 스타일 적용
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

                            {/* 3. 로그인 버튼 - size={{ xs: 12 }} 속성 유지 */}
                            <Grid item size={{ xs: 12 }}>
                                <ActionButton type="submit" fullWidth variant="contained">
                                    로그인
                                </ActionButton>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* 4. 회원가입 페이지로 이동하는 링크 추가 (디자인 일관성 유지) */}
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