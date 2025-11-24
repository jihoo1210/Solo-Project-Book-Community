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
import { BG_COLOR, HEADER_HEIGHT, LIGHT_TEXT_COLOR, RED_COLOR, TEXT_COLOR } from '../constants/Theme';

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

// 텍스트 필드 스타일 (회원가입 페이지와 동일)
const CustomTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-root': { color: LIGHT_TEXT_COLOR },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: TEXT_COLOR },
        '&:hover fieldset': { borderColor: TEXT_COLOR },
        '&.Mui-focused fieldset': {
            borderColor: TEXT_COLOR,
            borderWidth: '1px',
        },
        '&.Mui-error fieldset': {
            borderColor: RED_COLOR,
        },
        '&.Mui-error:hover fieldset': {
            borderColor: RED_COLOR,
        },
        '&.Mui-error.Mui-focused fieldset': {
            borderColor: RED_COLOR,
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
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [signinInfos, setSigninInfos] = useState({
        email: '',
        password: '',
        submit: ''
    });

    // URL 파라미터에서 이메일 추출
    useEffect(() => {
        const urlParams = new window.URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        if (email) setFormData(prev => ({ ...prev, email }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue;
        if(name === "password") {
            newValue = value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣\s]/g, "");
        } else {
            newValue = value.replace(/\s/g, '');
        }
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        setSigninInfos((prev) => ({ ...prev, [name]: '', submit: '' }));
    };

    const handleClickShowPassword = () => setShowPassword((s) => !s);

    // 로그인 API 요청
    const handleSubmit = (e) => {
        e.preventDefault();
        setSigninInfos({ email: '', password: '', submit: '' });
        let hasError = false;
        const newErrors = { email: "", username: "", password: "", submit: "" };

        if (!formData.email) {
            newErrors.email = '이메일을 입력해 주세요.'
            hasError = true
        }
        if (!formData.password || formData.password.length < 8) {
            newErrors.password = "비밀번호는 8자 이상이어야 합니다."
            hasError = true
        }
        if(hasError) {
            setSigninInfos(newErrors)
            return;
        }
        apiClient.post("/auth/signin", formData).then(response => {
            const signinData = response.data.result
            login(signinData.username, signinData.role);
            navigate("/");
        }).catch(error => {
            const errorMessage = error.response?.data?.message || '예상하지 못한 에러가 발생했습니다.';
            alert(errorMessage);
        });
    };

    return (
        <SigninWrapper>
            <Container maxWidth="md" disableGutters sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                                    error={!!signinInfos.email}
                                />
                                {!!signinInfos.email && (
                                    <Typography variant="caption" sx={{ mt: 0.5, ml: 1, display: 'block', color: RED_COLOR }}>
                                        {signinInfos.email}
                                    </Typography>
                                )}
                            </Grid>

                            {/* 비밀번호 입력 필드 */}
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth variant="outlined" required error={!!signinInfos.password}>
                                    <InputLabel sx={{ color: LIGHT_TEXT_COLOR }}>비밀번호(8자 이상)</InputLabel>
                                    <OutlinedInput
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        label="비밀번호(8자 이상)"
                                        sx={{
                                            '& fieldset': { borderColor: TEXT_COLOR },
                                            '&:hover fieldset': { borderColor: TEXT_COLOR },
                                            '&.Mui-focused fieldset': { borderColor: TEXT_COLOR, borderWidth: '1px' },
                                            '&.Mui-error fieldset': { borderColor: RED_COLOR },
                                            '&.Mui-error:hover fieldset': { borderColor: RED_COLOR },
                                            '&.Mui-error.Mui-focused fieldset': { borderColor: RED_COLOR, borderWidth: '1px' },
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
                                {!!signinInfos.password && (
                                    <Typography variant="caption" sx={{ mt: 0.5, ml: 1, display: 'block', color: RED_COLOR }}>
                                        {signinInfos.password}
                                    </Typography>
                                )}
                            </Grid>

                            {/* 로그인 제출 버튼 */}
                            <Grid size={{ xs: 12 }}>
                                <ActionButton type="submit" fullWidth variant="contained">
                                    로그인
                                </ActionButton>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* 회원가입 및 비밀번호 찾기 링크 */}
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
                            <Box component="span" sx={{ ml: 1, color: TEXT_COLOR, fontWeight: 600 }}>
                                회원가입
                            </Box>
                        </Link>
                        <Box component="span" sx={{ mx: 1, color: LIGHT_TEXT_COLOR, display: {xs: 'block', sm: 'inline'} }}>|</Box>
                        비밀번호를 잊어버리셨나요?
                        <Link to="/auth/resetPassword" style={{ textDecoration: 'none' }}>
                            <Box component="span" sx={{ ml: 1, color: TEXT_COLOR, fontWeight: 600 }}>
                                비밀번호 찾기
                            </Box>
                        </Link>
                    </Typography>
                </SigninCard>
            </Container>
        </SigninWrapper>
    );
};

export default SignIn;
