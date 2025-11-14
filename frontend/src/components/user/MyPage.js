import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Grid, Paper,
  IconButton, InputAdornment, FormControl, InputLabel, OutlinedInput
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import apiClient from '../../api/Api-Service';
import { useAuth } from '../auth/AuthContext';

// 색상 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';
const ERROR_COLOR = '#f44336'; // 붉은색 추가

const HEADER_HEIGHT = '64px';

// 레이아웃 래퍼
const MyPageWrapper = styled(Box)(({ theme }) => ({
  marginTop: HEADER_HEIGHT,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: BG_COLOR,
  padding: theme.spacing(4),
}));

// 카드 컨테이너
const MyPageCard = styled(Paper)(({ theme }) => ({
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
    // 읽기 전용 필드 스타일
    '&.Mui-disabled fieldset': { borderColor: alpha(TEXT_COLOR, 0.3) },
    '&.Mui-disabled .MuiInputBase-input': { color: LIGHT_TEXT_COLOR },
  },
}));

// 액션 버튼 (수정 완료)
const ActionButton = styled(Button)(({ theme }) => ({
  color: BG_COLOR,
  backgroundColor: TEXT_COLOR,
  fontWeight: 600,
  padding: theme.spacing(1.5),
  '&:hover': { backgroundColor: LIGHT_TEXT_COLOR },
}));

// 취소 버튼 (새로 추가)
const CancelButton = styled(Button)(({ theme }) => ({
  color: TEXT_COLOR,
  borderColor: TEXT_COLOR,
  fontWeight: 600,
  padding: theme.spacing(1.5),
  '&:hover': {
    borderColor: TEXT_COLOR,
    backgroundColor: alpha(TEXT_COLOR, 0.05),
  },
}));

// 중복검사 버튼
const DuplicateCheckButton = styled(Button)(({ theme }) => ({
  color: TEXT_COLOR,
  borderColor: TEXT_COLOR,
  fontWeight: 600,
  padding: theme.spacing(1.6, 4),
  minWidth: '140px',
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

const MyPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
  });
  
  const [initialUsername, setInitialUsername] = useState('');
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const { login, logout } = useAuth()
  
  // 비밀번호 토글 상태 분리
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await apiClient.get("/user/my")
            const userData = response.data.result
            if(userData) {
                setFormData({...userData})
                setInitialUsername(userData.username)
            }
        } catch (err) {
            console.log('err :>> ', err);
            const error = err.response.data.message || '처리되지 않은 예외'
            alert(error)
        }
    }
    fetchUserData();
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 띄어쓰기 방지 로직 적용
    const newValue = value.replace(/\s/g, '');

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    // 회원명 변경 시 중복 상태 초기화 (수정된 newValue 사용)
    if (name === 'username' && newValue !== initialUsername) {
      setIsUsernameAvailable(null);
    }
  };

  // 새 비밀번호 토글 핸들러
  const handleClickShowPassword = () => setShowPassword((s) => !s);
  // 비밀번호 확인 토글 핸들러
  const handleClickShowPasswordConfirm = () => setShowPasswordConfirm((s) => !s);

  // 취소 버튼 핸들러
  const handleCancel = () => {
    // 수정 모드 종료 및 비밀번호 필드 초기화
    setIsEditMode(false);
    setFormData((prev) => ({ 
      ...prev, 
      password: '',
      passwordConfirm: '',
      username: initialUsername, // 회원명도 초기값으로 되돌림
    }));
    setIsUsernameAvailable(null);
  }

  // 회원명 중복 체크 메서드 (로직 유지)
  const handleDuplicateCheck = () => {
    // formData.username은 이미 handleChange에서 띄어쓰기가 제거됨
    const currentUsername = formData.username; 
    if (!currentUsername) {
      alert('회원명을 입력해 주세요.');
      return;
    }
    if (currentUsername === initialUsername) {
      setIsUsernameAvailable(true);
      alert('현재 회원명과 동일합니다. 사용 가능합니다.');
      return;
    }

    apiClient.get(`auth/check-username?username=${currentUsername}`).then(response => {
        setIsUsernameAvailable(response.data.result.available)
        if(response.data.result.available) {
          alert('사용 가능한 회원명입니다.');
        } else {
          alert('이미 사용 중인 회원명입니다.');
        }
      })
      .catch(error => {
        console.log('중복 검사 오류:', error);
        setIsUsernameAvailable(false);
        alert('중복 검사에 실패했습니다.');
      });
  };

  // 회원 정보 수정 및 모드 토글 메서드
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isEditMode) {
      // 1. 수정 모드 시작
      setIsEditMode(true);
      setIsUsernameAvailable(formData.username === initialUsername ? true : null);
      return;
    }

    // 2. 수정 완료 (제출) - 로직 유지
    if (formData.username !== initialUsername && isUsernameAvailable !== true) {
      alert('수정된 회원명에 대해 중복 검사를 완료하거나 현재 회원명으로 유지해 주세요.');
      return;
    }
    
    if (formData.password || formData.passwordConfirm) {
        if (formData.password !== formData.passwordConfirm) {
            alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }
    }
    
    const updateData = {
        username: formData.username,
        ...(formData.password && { password: formData.password }) 
    };
    
    
    // API 호출 (PUT 또는 PATCH 메서드 사용 권장)
    apiClient.patch('/user/my/change-userInfo', updateData) 
      .then(response => {
        alert('회원 정보가 성공적으로 수정되었습니다.');
        // 수정 완료 후 읽기 모드로 전환 및 상태 초기화
        setIsEditMode(false);
        setFormData((prev) => ({
            ...prev,
            password: '',
            passwordConfirm: '',
        }));
        setInitialUsername(formData.username); // 실제 이름 업데이트 로직 필요
        login(formData.username)
      })
      .catch(error => {
        console.log('error', error)
        const errorMessage =  error.response?.data?.message || error.response
        alert(`수정 실패: ${errorMessage}`)
      })
  };

  const handleCancellation = async () => {
        apiClient.delete("/user/my/cancellation").then(res => {
            logout()
        }).catch(err => {
            console.log('err :>> ', err);
            const error = err.response.data.message || '처리되지 않은 예외'
            alert(error)
        })

  }

  return (
    <MyPageWrapper>
      <Container maxWidth="md" disableGutters sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <MyPageCard elevation={0}>
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
            {isEditMode ? '회원 정보 수정' : '마이 페이지'}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* 이메일 입력 필드 (항상 읽기 전용) */}
              <Grid size={{xs:12}}>
                <CustomTextField
                  fullWidth
                  label="이메일"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled 
                />
              </Grid>

              {/* 회원명 + 중복검사 버튼 */}
              <Grid size={{xs:12}}>
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
                    disabled={!isEditMode}
                  />
                  {/* 검사 버튼 (수정 모드일 때만 표시) */}
                  {isEditMode && (
                    <DuplicateCheckButton
                      variant="outlined"
                      onClick={handleDuplicateCheck}
                      disabled={!formData.username || (formData.username === initialUsername && isUsernameAvailable === true)}
                    >
                      검사
                    </DuplicateCheckButton>
                  )}
                </Box>
                {/* 중복 검사 결과 메시지 (수정 모드일 때만 표시) */}
                {isEditMode && isUsernameAvailable !== null && (
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

              {/* 비밀번호 입력 필드 (수정 모드일 때만 표시) */}
              {isEditMode && (
                <>
                  <Grid size={{xs:12}}>
                    {/* 새 비밀번호 필드 */}
                    <FormControl fullWidth variant="outlined">
                      <InputLabel sx={{ color: LIGHT_TEXT_COLOR }}>새 비밀번호</InputLabel>
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
                        label="새 비밀번호"
                      />
                    </FormControl>
                  </Grid>
                  {/* 비밀번호 확인 입력 필드 */}
                  <Grid size={{xs:12}}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel sx={{ color: LIGHT_TEXT_COLOR }}>비밀번호 확인</InputLabel>
                      <OutlinedInput
                        name="passwordConfirm"
                        type={showPasswordConfirm ? 'text' : 'password'}
                        value={formData.passwordConfirm}
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
                            <IconButton onClick={handleClickShowPasswordConfirm} edge="end">
                              {showPasswordConfirm ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="비밀번호 확인"
                      />
                    </FormControl>
                  </Grid>
                </>
              )}

              {/* 액션 버튼 그룹 */}
              <Grid size={{xs:12}}>
                {!isEditMode ? (
                  // 수정 모드 아닐 때: 회원 정보 수정 버튼 (전체 너비 유지)
                  <ActionButton type="submit" fullWidth variant="contained">
                    회원 정보 수정
                  </ActionButton>
                ) : (
                  // 수정 모드일 때: 수정 완료(왼쪽), 취소(오른쪽) 버튼
                  <Grid container spacing={1}>
                    <Grid size={{xs:6}}>
                      <ActionButton type="submit" fullWidth variant="contained">
                        수정 완료
                      </ActionButton>
                    </Grid>
                    <Grid size={{xs:6}}>
                      <CancelButton type="button" fullWidth variant="outlined" onClick={handleCancel}>
                        취소
                      </CancelButton>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Box>

          {/* 내가 쓴 글 보기 / 회원 탈퇴 링크 */}
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Link to="/my/actives" style={{ textDecoration: 'none' }}>
              <Typography
                variant="body2"
                sx={{ color: LIGHT_TEXT_COLOR, fontWeight: 500, '&:hover': { color: TEXT_COLOR } }}
              >
                내 활동 보기
              </Typography>
            </Link>
            <Typography variant="body2" sx={{ color: LIGHT_TEXT_COLOR }}>|</Typography>
              <Typography
                variant="body2"
                sx={{ color: ERROR_COLOR, fontWeight: 500, '&:hover': { color: '#FF6666' } }} // 붉은색 적용
                onClick={handleCancellation}
              >
                회원 탈퇴
              </Typography>
          </Box>

        </MyPageCard>
      </Container>
    </MyPageWrapper>
  );
};

export default MyPage;