// src/components/Signup.js

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
// 상수명 변경 없음: RED_COLOR, NEW_COLOR 그대로 사용
import { BG_COLOR, HEADER_HEIGHT, LIGHT_TEXT_COLOR, RED_COLOR, TEXT_COLOR, NEW_COLOR } from '../constants/Theme';

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

// 텍스트 필드 스타일 (오류 시 붉은색 테두리 유지)
const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': { color: LIGHT_TEXT_COLOR },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: TEXT_COLOR },
    '&:hover fieldset': { borderColor: TEXT_COLOR },
    // 오류가 아닐 때 포커스 시
    '&.Mui-focused fieldset': {
      borderColor: TEXT_COLOR,
      borderWidth: '1px',
    },
    // 오류일 때 포커스 및 호버 시 붉은색 유지
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

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [lastSentEmail, setLastSentEmail] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailVerificationInput, setShowEmailVerificationInput] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const navigate = useNavigate();
  const [isEmailVerified, setIsEmailVerified] = useState(false); 
  // 변수명 변경: signupErrors -> signupInfos
  const [signupInfos, setSignupInfos] = useState({
    email: '',
    username: '',
    password: '',
    submit: ''
  });
  // 변수명 변경: isEmailVerificationError -> emailVerificationInfo
  const [emailVerificationInfo, setEmailVerificationInfo] = useState('');


  // 오류 상태를 초기화하는 함수 (함수명은 직관적으로 clearError 유지)
  const clearError = (name) => {
    // signupErrors -> signupInfos
    setSignupInfos((prev) => ({ ...prev, [name]: '' }));
    // isEmailVerificationError -> emailVerificationInfo
    if (name === 'email') setEmailVerificationInfo('');
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value.replace(/\s/g, '');

    // 이메일 검증 코드 처리 로직 (6자리 대문자 또는 숫자만 허용)
    if (name === 'emailVerificationCode') {
      newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      setEmailVerificationCode(newValue);
      // CODE_SENT 메시지를 유지하기 위해 초기화 조건 변경
      // emailVerificationInfo 사용
      if (!emailVerificationInfo.startsWith('CODE_SENT:')) {
          setEmailVerificationInfo('');
      }
      return;
    }
    
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: newValue };

      // 사용자가 이메일을 수정했는지 확인하는 로직
      if (name === 'email' && value !== prev.email) {
        // 이메일 주소가 변경되면 인증 상태 초기화 및 오류 메시지 표시
        if (showEmailVerificationInput && value !== lastSentEmail) {
            setShowEmailVerificationInput(false);
            setEmailVerificationCode('');
            setIsEmailVerified(false); 
            // 이메일 변경 시 인증 초기화 메시지 표시
            // emailVerificationInfo 사용
            setEmailVerificationInfo('이메일 주소가 변경되어 인증 상태가 초기화되었습니다. 다시 전송 버튼을 눌러주세요.');
        }
      }

      return updatedFormData;
    });

    if (name === 'username') setIsUsernameAvailable(null); // 회원명 변경 시 중복 상태 초기화
    
    clearError(name); // 입력 변경 시 해당 필드의 오류 초기화
  };

  const handleClickShowPassword = () => setShowPassword((s) => !s);
  
  // 이메일 전송 버튼 클릭 메서드
  const handleSendVerificationEmail = async () => {
    clearError('email');
    // emailVerificationInfo 사용
    setEmailVerificationInfo('');

    if (!formData.email.trim()) {
      // signupErrors -> signupInfos
      setSignupInfos(prev => ({ ...prev, email: '이메일을 입력해 주세요.' }));
      return;
    }
    
    try {
      // 이메일 중복 검사 및 코드 전송 API 호출
      const response = await apiClient.get(`/auth/check-email?email=${formData.email}`)
      const isAvailable = response.data.result.available

      if (isAvailable) {
        setShowEmailVerificationInput(true);
        setLastSentEmail(formData.email); // 전송한 이메일 주소를 저장
        setIsEmailVerified(false); // 재전송 시 인증 완료 상태 초기화
        // 성공 메시지에 특수 접두사 추가
        // emailVerificationInfo 사용
        setEmailVerificationInfo('CODE_SENT:인증 코드가 전송되었습니다. 이메일을 확인해 주세요.');
      } else {
        // 서버에서 이메일이 이미 사용 중이라고 응답했을 때
        // signupErrors -> signupInfos
        setSignupInfos(prev => ({ ...prev, email: '이미 사용 중인 이메일 주소입니다.' }));
      }
      
    } catch (error) {
      // API 호출 자체에 오류가 발생했을 때
      const errorMessage = error.response?.data?.message || "이메일 검증 및 전송 중 오류가 발생했습니다.";
      // emailVerificationInfo 사용
      setEmailVerificationInfo(errorMessage);
    }
  };

  // 이메일 인증 버튼 클릭 메서드 
  const handleVerifyEmailCode = () => {
    // emailVerificationInfo 사용
    setEmailVerificationInfo('');

    if (emailVerificationCode.length !== 6) {
      // emailVerificationInfo 사용
      setEmailVerificationInfo('6자리의 인증 코드를 입력해야 합니다.');
      return;
    }
    
    try {
      const url = `/auth/verify-code?email=${formData.email}&code=${emailVerificationCode}`
      apiClient.get(url)
      setIsEmailVerified(true)
      setEmailVerificationInfo('CODE_SUCCESS:이메일 인증이 성공적으로 완료되었습니다.');
    } catch (error) {
      console.log(error.response.data.message || "이메일 인증 중 오류가 발생했습니다.")
      setIsEmailVerified(false);
      setEmailVerificationInfo('CODE_ERROR:인증 코드가 일치하지 않습니다.');
    }
  };

  // 회원명 중복 체크 메서드
  const handleDuplicateCheck = () => {
    clearError('username');
    const currentUsername = formData.username.trim();

    if (!currentUsername) {
      // signupErrors -> signupInfos
      setSignupInfos(prev => ({ ...prev, username: '회원명을 입력해 주세요.' }));
      return;
    }
    
    // API 호출
    apiClient.get(`auth/check-username?username=${currentUsername}`).then(response => {
        setIsUsernameAvailable(response.data.result.available)

        if(response.data.result.available) {
          // 성공 메시지
          // signupErrors -> signupInfos
          setSignupInfos(prev => ({ ...prev, username: '사용 가능한 회원명입니다.' }));
        } else {
          // 실패 메시지
          // signupErrors -> signupInfos
          setSignupInfos(prev => ({ ...prev, username: '이미 사용 중인 회원명입니다.' }));
        }
      })
      .catch(error => {
        const errorMessage = error.response?.data?.message || '회원명 검사 중 오류가 발생했습니다.';
        // API 오류 메시지 표시
        // signupErrors -> signupInfos
        setSignupInfos(prev => ({ ...prev, username: errorMessage }));
        setIsUsernameAvailable(false);
      })
  };

  // 회원가입 api 요청 메서드
  const handleSubmit = (e) => {
    e.preventDefault();
    // signupErrors -> signupInfos
    setSignupInfos({ email: '', username: '', password: '', submit: '' });

    // 1. 회원명 중복 검사 여부 확인
    if (isUsernameAvailable !== true) {
      // signupErrors -> signupInfos
      setSignupInfos(prev => ({ ...prev, username: prev.username || '회원명 중복 검사를 완료해 주세요.' }));
      return;
    }
    
    // 2. 이메일 인증 완료 여부 확인
    if (showEmailVerificationInput && !isEmailVerified) {
      // emailVerificationInfo 사용
      setEmailVerificationInfo('이메일 인증을 완료해 주세요.');
      return;
    }

    // 3. 비밀번호 유효성 검사 (예시)
    // if (formData.password.length < 8) {
    //     setSignupInfos(prev => ({ ...prev, password: '비밀번호는 최소 8자 이상이어야 합니다.' }));
    //     return;
    // }
    
    // 4. API 호출
    apiClient.post('auth/signup', formData).then(response => {


      if (response.data && response.data.result && response.data.result.email) {
          navigate("/auth/signin?email=" + response.data.result.email);
      } else {
          // 최종 성공 후 서버 응답에 문제가 있는 경우
          // signupErrors -> signupInfos
          setSignupInfos(prev => ({ 
              ...prev, 
              submit: '회원가입은 성공했으나, 서버 응답에 문제가 있습니다. 로그인 페이지로 이동합니다.' 
          }));
          navigate("/auth/signin");
      }
    })
      .catch(error => {
        const errorMessage =  error.response?.data?.message || '회원가입 처리 중 오류가 발생했습니다.'
        // signupErrors -> signupInfos
        setSignupInfos(prev => ({ ...prev, submit: errorMessage }));
      })
  };

  const isEmailChanged = formData.email !== lastSentEmail;
  const isVerifyButtonDisabled = emailVerificationCode.length !== 6 || isEmailVerified;
  // 이메일 전송 버튼 비활성화: 이메일이 유효하고, 코드가 전송되었으며, 변경되지 않았을 때
  const isSendButtonDisabled = showEmailVerificationInput && !isEmailChanged;

  // NEW_COLOR를 사용할 색상 결정 로직 함수
  const getEmailMessageColor = () => {
    // emailVerificationInfo 사용
    if (!emailVerificationInfo) return RED_COLOR; 

    // 인증 완료는 항상 NEW_COLOR
    if (isEmailVerified) return NEW_COLOR;
    
    // 코드가 전송되었거나 인증 성공 메시지이면 NEW_COLOR
    if (emailVerificationInfo.startsWith('CODE_SENT:') || emailVerificationInfo.startsWith('CODE_SUCCESS:')) return NEW_COLOR;
    // 그 외 일반 오류 메시지
    return RED_COLOR;
  };

  // 메시지에서 특수 접두사를 제거하는 함수
  const getCleanEmailMessage = (message) => {
    if (message.startsWith('CODE_SENT:')) {
      return message.replace('CODE_SENT:', '');
    }
    if (message.startsWith('CODE_SUCCESS:')) {
      return message.replace('CODE_SUCCESS:', '');
    }
    if (message.startsWith('CODE_ERROR:')) {
      return message.replace('CODE_ERROR:', '');
    }
    return message;
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
                    // NEW: 오류 및 도움말 텍스트 추가
                    // signupInfos 사용, 이메일 입력 필드 아래는 CODE_SENT, CODE_SUCCESS, CODE_ERROR를 표시하지 않음
                    error={
                        !!signupInfos.email || 
                        (!!emailVerificationInfo && !emailVerificationInfo.startsWith('CODE_SENT:') && !emailVerificationInfo.startsWith('CODE_SUCCESS:') && !emailVerificationInfo.startsWith('CODE_ERROR:'))
                    }
                    helperText={signupInfos.email}
                  />
                  <DuplicateCheckButton
                    variant="outlined"
                    onClick={handleSendVerificationEmail}
                    disabled={isSendButtonDisabled}
                  >
                    {showEmailVerificationInput && !isEmailChanged && !isEmailVerified ? '재전송' : '전송'}
                  </DuplicateCheckButton>
                </Box>
                {/* 이메일 전송/인증 관련 메시지 (CODE_ERROR를 제외한 메시지만 표시) */}
                {!!emailVerificationInfo && !emailVerificationInfo.startsWith('CODE_ERROR:') && (
                    <Typography
                      variant="caption"
                      sx={{ 
                        mt: 0.5, ml: 1, display: 'block', 
                        // 색상 결정 함수 사용
                        color: getEmailMessageColor()
                      }}
                    >
                      {getCleanEmailMessage(emailVerificationInfo)}
                    </Typography>
                )}
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
                      slotProps={{
                        input: {
                          maxLength: 6,
                          style: { textTransform: 'uppercase' }
                        } 
                      }}
                      value={emailVerificationCode}
                      onChange={handleChange}
                      required
                      disabled={isEmailVerified}
                      // NEW: 이메일 인증 오류 메시지 표시
                      // 인증이 완료되지 않았고, 오류 메시지가 있으며, 해당 메시지가 성공 메시지가 아닐 때 오류 상태 표시
                      error={
                        !isEmailVerified && 
                        !!emailVerificationInfo && 
                        !emailVerificationInfo.startsWith('CODE_SENT:') &&
                        !emailVerificationInfo.startsWith('CODE_SUCCESS:')
                      }
                      helperText={
                        // 인증이 완료되지 않았고, 오류 메시지가 있으며, 해당 메시지가 성공 메시지가 아닐 때 헬퍼 텍스트 표시
                        !isEmailVerified && 
                        !!emailVerificationInfo && 
                        !emailVerificationInfo.startsWith('CODE_SENT:') &&
                        !emailVerificationInfo.startsWith('CODE_SUCCESS:')
                        ? getCleanEmailMessage(emailVerificationInfo) 
                        : null
                      }
                    />
                    <DuplicateCheckButton
                      variant="outlined"
                      onClick={handleVerifyEmailCode}
                      disabled={isVerifyButtonDisabled}
                    >
                      {isEmailVerified ? '인증 완료' : '인증'}
                    </DuplicateCheckButton>
                  </Box>
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
                    // NEW: 오류 및 도움말 텍스트 추가
                    // signupErrors -> signupInfos
                    error={
                        !!signupInfos.username && 
                        signupInfos.username !== '사용 가능한 회원명입니다.'
                    }
                    helperText={
                        // signupErrors -> signupInfos
                        (!!signupInfos.username && 
                        signupInfos.username !== '사용 가능한 회원명입니다.') 
                        ? signupInfos.username 
                        : null
                    }
                  />
                  <DuplicateCheckButton
                    variant="outlined"
                    onClick={handleDuplicateCheck}
                    disabled={!formData.username}
                  >
                    검사
                  </DuplicateCheckButton>
                </Box>
                {/* 중복 검사 결과 메시지 (성공 메시지는 별도로 표시) */}
                {/* signupErrors -> signupInfos */}
                {isUsernameAvailable !== null && signupInfos.username && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      ml: 1,
                      display: 'block',
                      textAlign: { xs: 'center', sm: 'left' },
                      // NEW_COLOR를 사용하도록 변경
                      color: isUsernameAvailable ? NEW_COLOR : RED_COLOR,
                    }}
                  >
                    {signupInfos.username}
                  </Typography>
                )}
              </Grid>

              {/* 비밀번호 입력 필드 */}
              <Grid item size={{ xs: 12 }}>
                <FormControl 
                    fullWidth 
                    variant="outlined" 
                    required
                    // NEW: 비밀번호 오류 상태 설정
                    // signupErrors -> signupInfos
                    error={!!signupInfos.password}
                >
                  <InputLabel sx={{ color: LIGHT_TEXT_COLOR }}>비밀번호</InputLabel>
                  <OutlinedInput
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    sx={{
                      // NEW: 오류 시 붉은색 테두리
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
                {/* NEW: 비밀번호 오류 메시지 */}
                {/* signupErrors -> signupInfos */}
                {!!signupInfos.password && (
                    <Typography
                      variant="caption"
                      sx={{ 
                        mt: 0.5, ml: 1, display: 'block', 
                        color: RED_COLOR 
                      }}
                    >
                      {signupInfos.password}
                    </Typography>
                )}
              </Grid>

              {/* 회원가입 제출 버튼 */}
              <Grid item size={{ xs: 12 }}>
                <ActionButton type="submit" fullWidth variant="contained">
                  회원가입
                </ActionButton>
              </Grid>
            </Grid>
          </Box>
          
          {/* NEW: 전반적인 제출 오류 메시지 */}
          {/* signupErrors -> signupInfos */}
          {!!signupInfos.submit && (
            <Typography
              variant="body2"
              align="center"
              sx={{
                mt: 3,
                color: RED_COLOR,
                fontWeight: 600,
              }}
            >
              ⚠️ {signupInfos.submit}
            </Typography>
          )}

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