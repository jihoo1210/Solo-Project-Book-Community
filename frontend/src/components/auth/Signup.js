import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Grid, Paper,
  IconButton, InputAdornment, FormControl, InputLabel, OutlinedInput
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import apiClient from '../../api/Api-Service'; // 오류 발생으로 인해 주석 처리

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

// 중복검사/전송/인증 버튼 (동일한 디자인)
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
  // 이전 이메일 값을 저장하여 변경 여부를 감지
  const [lastSentEmail, setLastSentEmail] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  // NEW: 이메일 인증 관련 상태 추가
  const [showEmailVerificationInput, setShowEmailVerificationInput] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const navigate = useNavigate();
  // NEW: 이메일 인증 완료 상태 추가
  const [isEmailVerified, setIsEmailVerified] = useState(false); 

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value.replace(/\s/g, '');

    // NEW: 이메일 검증 코드 처리 로직 추가 (6자리 대문자 또는 숫자만 허용)
    if (name === 'emailVerificationCode') {
      newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      setEmailVerificationCode(newValue);
      return;
    }
    
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: newValue };

      // 사용자가 이메일을 수정했는지 확인하는 로직 추가
      if (name === 'email' && value !== prev.email) {
        // 이메일 주소가 변경되면 인증 상태 초기화
        if (showEmailVerificationInput && value !== lastSentEmail) {
            setShowEmailVerificationInput(false);
            setEmailVerificationCode('');
            setIsEmailVerified(false); // 인증 완료 상태 초기화
            // NOTE: alert() 대신 메시지 박스를 사용해야 하지만, 기존 코드의 패턴을 유지합니다.
            // alert('이메일 주소가 변경되어 인증 상태가 초기화되었습니다. 다시 전송 버튼을 눌러주세요.');
        }
      }

      return updatedFormData;
    });

    if (name === 'username') setIsUsernameAvailable(null); // 회원명 변경 시 중복 상태 초기화
  };

  const handleClickShowPassword = () => setShowPassword((s) => !s);
  
  // NEW: 이메일 전송 버튼 클릭 메서드
  const handleSendVerificationEmail = () => {
    if (!formData.email.trim()) {
      // NOTE: alert() 대신 메시지 박스를 사용해야 하지만, 기존 코드의 패턴을 유지합니다.
      alert('이메일을 입력해 주세요.');
      return;
    }
    
    // API 호출 로직은 요청에 따라 추가하지 않고, 인증 코드 입력란만 표시
    console.log(`이메일: ${formData.email}로 검증 코드 전송 시도...`);
    
    // 실제로 서버에서 코드를 전송하는 API가 호출되어야 함
    setShowEmailVerificationInput(true);
    setLastSentEmail(formData.email); // 전송한 이메일 주소를 저장
    setIsEmailVerified(false); // 재전송 시 인증 완료 상태 초기화
    
    // 코드 전송이 성공했다고 가정하고 메시지를 띄웁니다.
    // NOTE: alert() 대신 메시지 박스를 사용해야 하지만, 기존 코드의 패턴을 유지합니다.
    alert('인증 코드가 이메일로 전송되었습니다. 6자리 코드를 입력해주세요.');
  };

  // NEW: 이메일 인증 버튼 클릭 메서드 (기능 없이 UI만 구현)
  const handleVerifyEmailCode = () => {
    if (emailVerificationCode.length !== 6) {
      alert('6자리의 인증 코드를 입력해야 합니다.');
      return;
    }
    console.log(`인증 코드: ${emailVerificationCode} 검증 시도...`);
    
    // TODO: 실제 서버 API 호출 및 응답 처리 로직 구현 필요
    
    // 모의 성공 처리
    setIsEmailVerified(true);
    alert('이메일 인증이 완료되었습니다.');
  };

  // 회원명 중복 체크 메서드
  const handleDuplicateCheck = () => {
    const currentUsername = formData.username.trim();
    if (!currentUsername) {
      // NOTE: alert() 대신 메시지 박스를 사용해야 하지만, 기존 코드의 패턴을 유지합니다.
      alert('회원명을 입력해 주세요.');
      return;
    }
    console.log(`${currentUsername} 중복 검사 실행...`);
    // API 호출
    apiClient.get(`auth/check-username?username=${currentUsername}`).then(response => {
      console.log(response.data.result.available)
        setIsUsernameAvailable(response.data.result.available)

        if(response.data.result.available) {
          // NOTE: alert() 대신 메시지 박스를 사용해야 하지만, 기존 코드의 패턴을 유지합니다.
          alert('사용 가능한 회원명입니다.');
        } else {
          // NOTE: alert() 대신 메시지 박스를 사용해야 하지만, 기존 코드의 패턴을 유지합니다.
          alert('이미 사용 중인 회원명입니다.');
        }
      })
  };

  // 회원가입 api 요청 메서드
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUsernameAvailable !== true) {
      // NOTE: alert() 대신 메시지 박스를 사용해야 하지만, 기존 코드의 패턴을 유지합니다.
      alert('회원명 중복 검사를 완료해 주세요.');
      return;
    }

    // 이메일 인증 코드가 표시되었고, 인증이 완료되지 않았다면 경고
    if (showEmailVerificationInput && !isEmailChanged && !isEmailVerified) {
      // NOTE: alert() 대신 메시지 박스를 사용해야 하지만, 기존 코드의 패턴을 유지합니다.
      alert('이메일 인증을 완료해 주세요.');
      return;
    }
    // TODO: 실제 API에서는 이메일 인증 코드를 서버로 보내서 검증하는 로직이 추가되어야 함

    console.log('회원가입 요청 데이터:', formData);
    apiClient.post('auth/signup', formData).then(response => {
      
      console.log('성공 응답 데이터:', response.data);

      if (response.data && response.data.result && response.data.result.email) {
          navigate("/auth/signin?email=" + response.data.result.email);
      } else {
          // NOTE: alert() 대신 메시지 박스를 사용해야 하지만, 기존 코드의 패턴을 유지합니다.
          alert('회원가입은 성공했으나, 서버 응답에서 이메일 정보를 받지 못했습니다. 로그인 페이지로 이동합니다.');
          navigate("/auth/signin");
      }
    })
      .catch(error => {
        console.log('error', error)
        const errorMessage =  error.response?.data?.message || error.response
        // NOTE: alert() 대신 메시지 박스를 사용해야 하지만, 기존 코드의 패턴을 유지합니다.
        alert(errorMessage)
      })
  };

  // 이메일이 마지막으로 전송된 이메일과 다른지 확인하는 플래그
  const isEmailChanged = formData.email !== lastSentEmail;
  // 전송 버튼 활성화 조건: 이메일이 입력되었고, (인증 코드가 표시되지 않았거나 || 이메일이 변경되었을 때)
  const isSendButtonDisabled = !formData.email || (showEmailVerificationInput && !isEmailChanged && !isEmailVerified);
  // 인증 버튼 활성화 조건: 6자리 코드가 모두 입력되었고, 아직 인증되지 않았을 때
  const isVerifyButtonDisabled = emailVerificationCode.length !== 6 || isEmailVerified;

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
              
              {/* 이메일 입력 필드 + 전송 버튼 */}
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
                    label="이메일"
                    name="email"
                    type="text"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {/* 회원명 검증 버튼과 동일한 디자인 */}
                  <DuplicateCheckButton
                    variant="outlined"
                    onClick={handleSendVerificationEmail}
                    disabled={isSendButtonDisabled}
                  >
                    {showEmailVerificationInput && !isEmailChanged && !isEmailVerified ? '재전송' : '전송'}
                  </DuplicateCheckButton>
                </Box>
              </Grid>

              {/* 이메일 검증 코드 입력 필드 + 인증 버튼 */}
              {showEmailVerificationInput && !isEmailChanged && (
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
                      label="인증 코드 (6자리 대문자/숫자)"
                      name="emailVerificationCode"
                      type="text"
                      inputProps={{
                        maxLength: 6,
                        style: { textTransform: 'uppercase' } // 시각적으로 대문자 표시
                      }}
                      value={emailVerificationCode}
                      onChange={handleChange}
                      required
                      disabled={isEmailVerified}
                    />
                    {/* NEW: 인증 버튼 (검사/전송 버튼과 동일 디자인) */}
                    <DuplicateCheckButton
                      variant="outlined"
                      onClick={handleVerifyEmailCode}
                      disabled={isVerifyButtonDisabled}
                    >
                      {isEmailVerified ? '인증 완료' : '인증'}
                    </DuplicateCheckButton>
                  </Box>
                  {/* 인증 완료 메시지 */}
                  {isEmailVerified && (
                    <Typography
                      variant="caption"
                      sx={{ mt: 0.5, ml: 1, display: 'block', color: 'green' }}
                    >
                      이메일 인증이 성공적으로 완료되었습니다.
                    </Typography>
                  )}
                </Grid>
              )}

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