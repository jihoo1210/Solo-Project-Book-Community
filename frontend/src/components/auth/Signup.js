import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Grid, Paper,
  IconButton, InputAdornment, FormControl, InputLabel, OutlinedInput
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import apiClient from '../../api/Api-Service';

// 색상 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';

const HEADER_HEIGHT = '64px';

// 레이아웃 래퍼
const SignupWrapper = styled(Box)(({ theme }) => ({
  marginTop: HEADER_HEIGHT,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: BG_COLOR,
  padding: theme.spacing(4),
}));

// 카드 컨테이너
const SignupCard = styled(Paper)(({ theme }) => ({
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

// 회원가입 버튼
const ActionButton = styled(Button)(({ theme }) => ({
  color: BG_COLOR,
  backgroundColor: TEXT_COLOR,
  fontWeight: 600,
  padding: theme.spacing(1.5),
  '&:hover': { backgroundColor: LIGHT_TEXT_COLOR },
}));

// 중복검사 버튼
const DuplicateCheckButton = styled(Button)(({ theme }) => ({
  color: TEXT_COLOR,
  borderColor: TEXT_COLOR,
  fontWeight: 600,
  padding: theme.spacing(1.6, 4), // 높이와 가로폭 조정
  minWidth: '140px',              // 버튼 최소 너비 확장
  whiteSpace: 'nowrap',
  fontSize: '1rem',
  '&:hover': {
    borderColor: TEXT_COLOR,
    backgroundColor: alpha(TEXT_COLOR, 0.05),
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '100%',
    padding: theme.spacing(1.5, 2),
  },
}));

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    if (name === 'username') setIsUsernameAvailable(null); // 회원명 변경 시 중복 상태 초기화
  };

  const handleClickShowPassword = () => setShowPassword((s) => !s);

  // 회원명 중복 체크 메서드 (모의 구현)
  const handleDuplicateCheck = () => {
    const currentUsername = formData.username.trim();
    if (!currentUsername) {
      alert('회원명을 입력해 주세요.');
      return;
    }
    console.log(`${currentUsername} 중복 검사 실행...`);
    // 실제 API 호출 대신 모의 로직 사용
    apiClient.get(`auth/check-username?username=${currentUsername}`).then(response => {
      console.log(response.data.result.available)
        setIsUsernameAvailable(response.data.result.available)

        if(response.data.result.available) {
          alert('사용 가능한 회원명입니다.');
        } else {
          alert('이미 사용 중인 회원명입니다.');
        }
      })
  };

  // 회원가입 api 요청 메서드
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUsernameAvailable !== true) {
      alert('회원명 중복 검사를 완료해 주세요.');
      return;
    }
    console.log('회원가입 요청 데이터:', formData);
    apiClient.post('auth/signup', formData).then(response => {
      
      console.log('성공 응답 데이터:', response.data);

      if (response.data && response.data.result && response.data.result.email) {
          alert(`회원가입 성공! 이메일: ${response.data.result.email}`);
          navigate("/auth/signin?email=" + response.data.result.email);
      } else {
          alert('회원가입은 성공했으나, 서버 응답에서 이메일 정보를 받지 못했습니다. 로그인 페이지로 이동합니다.');
          navigate("/auth/signin");
      }
    })
      .catch(error => {
        console.log('error', error)
        const errorMessage =  error.response?.data?.message || error.response
        alert(errorMessage)
      })
  };

  return (
    <SignupWrapper>
      <Container maxWidth="md" disableGutters sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <SignupCard elevation={0}>
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
            회원가입
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* 이메일 입력 필드 */}
              <Grid item size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  label="이메일"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* 회원명 + 중복검사 버튼 */}
              <Grid item size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    alignItems: { xs: 'center', sm: 'flex-start' },
                  }}
                >
                  <CustomTextField
                    fullWidth
                    label="회원명 (Username)"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <DuplicateCheckButton
                    variant="outlined"
                    onClick={handleDuplicateCheck}
                    disabled={!formData.username}
                  >
                    검사
                  </DuplicateCheckButton>
                </Box>
                {/* 중복 검사 결과 메시지 */}
                {isUsernameAvailable !== null && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      ml: 1,
                      display: 'block',
                      textAlign: { xs: 'center', sm: 'left' },
                      color: isUsernameAvailable ? 'green' : 'red',
                    }}
                  >
                    {isUsernameAvailable
                      ? '사용 가능한 회원명입니다.'
                      : '이미 사용 중이거나 유효하지 않은 회원명입니다.'}
                  </Typography>
                )}
              </Grid>

              {/* 비밀번호 입력 필드 */}
              <Grid item size={{ xs: 12 }}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel sx={{ color: LIGHT_TEXT_COLOR }}>비밀번호</InputLabel>
                  <OutlinedInput
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
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
                    label="비밀번호"
                  />
                </FormControl>
              </Grid>

              {/* 회원가입 제출 버튼 */}
              <Grid item size={{ xs: 12 }}>
                <ActionButton type="submit" fullWidth variant="contained">
                  회원가입
                </ActionButton>
              </Grid>
            </Grid>
          </Box>

          {/* 로그인 페이지 링크 */}
          <Typography
            variant="body2"
            align="center"
            sx={{
              mt: 3,
              color: LIGHT_TEXT_COLOR,
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
            }}
          >
            계정이 이미 있으신가요?
            <Link to="/auth/signin" style={{ textDecoration: 'none' }}>
              <Box
                component="span"
                sx={{ ml: 1, color: TEXT_COLOR, fontWeight: 600 }}
              >
                로그인
              </Box>
            </Link>
          </Typography>
        </SignupCard>
      </Container>
    </SignupWrapper>
  );
};

export default Signup;