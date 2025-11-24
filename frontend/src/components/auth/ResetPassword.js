import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import apiClient from "../../api/Api-Service";
import {
  BG_COLOR,
  HEADER_HEIGHT,
  LIGHT_TEXT_COLOR,
  TEXT_COLOR,
  RED_COLOR,
  NEW_COLOR,
  AQUA_BLUE,
} from "../constants/Theme";
import { Link, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

// 공통 스타일
const ResetWrapper = styled(Box)(({ theme }) => ({
  marginTop: HEADER_HEIGHT,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: BG_COLOR,
  padding: theme.spacing(4),
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  boxSizing: "border-box",
}));

const ResetCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: "100%",
  borderRadius: (theme.shape?.borderRadius || 4) * 2,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  border: `1px solid ${TEXT_COLOR}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
  },
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputLabel-root": { color: LIGHT_TEXT_COLOR },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: TEXT_COLOR },
    "&:hover fieldset": { borderColor: TEXT_COLOR },
    "&.Mui-focused fieldset": {
      borderColor: TEXT_COLOR,
      borderWidth: "1px",
    },
    "&.Mui-error fieldset": {
      borderColor: RED_COLOR,
    },
    "&.Mui-error:hover fieldset": {
      borderColor: RED_COLOR,
    },
    "&.Mui-error.Mui-focused fieldset": {
      borderColor: RED_COLOR,
      borderWidth: "1px",
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  color: BG_COLOR,
  backgroundColor: TEXT_COLOR,
  fontWeight: 600,
  padding: theme.spacing(1.5),
  "&:hover": { backgroundColor: LIGHT_TEXT_COLOR },
}));

const DuplicateCheckButton = styled(Button)(({ theme }) => ({
  color: TEXT_COLOR,
  borderColor: TEXT_COLOR,
  fontWeight: 600,
  padding: theme.spacing(1.6, 4),
  minWidth: "140px",
  whiteSpace: "nowrap",
  fontSize: "1rem",
  "&:hover": {
    borderColor: TEXT_COLOR,
    backgroundColor: alpha(TEXT_COLOR, 0.05),
  },
  [theme.breakpoints.down("sm")]: {
    minWidth: "100%",
    padding: theme.spacing(1.5, 2),
  },
}));

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });

  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    submit: "",
  });

  const [lastSentEmail, setLastSentEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [emailVerificationInfo, setEmailVerificationInfo] = useState("");
  const [showEmailVerificationInput, setShowEmailVerificationInput] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigater = useNavigate();

  // 입력 변경 시 오류 초기화 + 이메일 변경 감지
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue;
    if(name === "password" || name === "passwordConfirm") {
      newValue = value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣\s]/g, "")
    } else {
      newValue = value.replace(/\s/g, "");
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "email") {
      if (newValue !== lastSentEmail) {
        // 이메일이 바뀌면 인증 상태 초기화
        setShowEmailVerificationInput(false);
        setEmailVerificationCode("");
        setIsEmailVerified(false);
        setEmailVerificationInfo("");
      } else if(newValue !== '') {
        // 다시 원래 이메일로 입력하면 인증 코드 입력란 복원
        setShowEmailVerificationInput(true);
      } else {
        setShowEmailVerificationInput(false)
      }
    }
  };

  const handleClickShowPassword = () => setShowPassword((s) => !s);
  const handleClickShowPasswordConfirm = () =>
    setShowPasswordConfirm((s) => !s);

  // 이메일 전송
  const handleSendVerificationEmail = async () => {
    if (!formData.email.trim()) {
      setFormErrors((prev) => ({ ...prev, email: "이메일을 입력해 주세요." }));
      return;
    }
    try {
      setFormErrors(prev => ({...prev, email: ''}))
      setIsLoading(true);
      // 이메일 전송 요청
      const response = await apiClient.get(
        `/auth/send-code?email=${formData.email}`
      );
      if (response) {
        setFormErrors({
          email: "",
          password: "",
          passwordConfirm: "",
          submit: "",
        });
        setEmailVerificationInfo(
          "CODE_SENT: 인증 코드가 전송되었습니다. 이메일을 확인해 주세요."
        );
        setShowEmailVerificationInput(true);
        setLastSentEmail(formData.email); // 마지막 전송 이메일 저장
        setIsEmailVerified(false);
      }
    } catch (error) {
      setFormErrors((prev) => ({
        ...prev,
        email:
          error.response?.data?.message ||
          "이메일 인증 요청 중 오류가 발생했습니다.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 코드 검증
  const handleVerifyEmailCode = async () => {
    if (emailVerificationCode.length !== 6) {
      setEmailVerificationInfo("CODE_ERROR: 6자리 인증 코드를 입력하세요.");
      return;
    }
    try {
      const url = `/auth/verify-code/get-username?email=${formData.email}&code=${emailVerificationCode}`;
      const response = await apiClient.get(url);
      console.log(response)
      const username = response.data.result.username;
      setIsEmailVerified(true);
      setFormData((prev) => ({
        ...prev,
        username: username,
      }));
      
      // 성공 시 오류 초기화
      setFormErrors({
        email: "",
        password: "",
        passwordConfirm: "",
        submit: "",
      });
      setEmailVerificationInfo("CODE_SUCCESS: 이메일 인증 완료");
    } catch(error) {
      console.log(error)
      setIsEmailVerified(false);
      setEmailVerificationInfo("CODE_ERROR:" + (error.response?.data?.message || "인증 코드가 일치하지 않습니다."));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({ email: "", password: "", passwordConfirm: "", submit: "" });

    let hasError = false;
    const newErrors = {
      email: "",
      password: "",
      passwordConfirm: "",
      submit: "",
    };

    if (!isEmailVerified) {
      newErrors.email = "이메일 인증을 먼저 완료해 주세요.";
      hasError = true;
    }
    if (!formData.password || formData.password.length < 8) {
            newErrors.password = "비밀번호는 8자 이상이어야 합니다."
            hasError = true
    }
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호와 확인이 일치하지 않습니다.";
      hasError = true;
    }

    if (hasError) {
      setFormErrors(newErrors);
      return;
    }

    // 비밀번호 재설정 성공 시
    try {
      await apiClient.patch("/temp/reset-password", {
        email: formData.email,
        password: formData.password,
      });
      // 성공 시 오류 초기화
      setFormErrors({
        email: "",
        password: "",
        passwordConfirm: "",
        submit: "",
      });
      alert("비밀번호가 성공적으로 재설정되었습니다.");
      navigater("/auth/signin")
    } catch (error) {
      setFormErrors((prev) => ({
        ...prev,
        submit: "비밀번호 재설정 실패",
      }));
    }
  };

  return (
    <ResetWrapper>
      <Container maxWidth="sm" disableGutters>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            component={Link}
            to={"/auth/signin"}
            startIcon={<ArrowBack />}
            sx={{
              color: TEXT_COLOR,
              "&:hover": { backgroundColor: alpha(TEXT_COLOR, 0.05) },
            }}
          >
            로그인으로
          </Button>
        </Box>
        <ResetCard elevation={0}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 4, color: TEXT_COLOR }}
          >
            비밀번호 재설정
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ width: "100%" }}
          >
            <Grid container spacing={3}>
              {/* 이메일 입력 + 전송 버튼 */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <CustomTextField
                    fullWidth
                    label="이메일"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={!!formErrors.email}
                  />
                  <DuplicateCheckButton
                    variant="outlined"
                    onClick={handleSendVerificationEmail}
                    disabled={isLoading}
                  >
                    {showEmailVerificationInput &&
                    formData.email === lastSentEmail &&
                    !isEmailVerified
                      ? "재전송"
                      : "전송"}
                  </DuplicateCheckButton>
                </Box>

                {/* 이메일 오류 메시지 */}
                {!!formErrors.email && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1, display: "block", color: RED_COLOR }}
                  >
                    {formErrors.email}
                  </Typography>
                )}

                {/* 이메일 전송 로딩 메시지 */}
                {isLoading && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1, display: "block", color: AQUA_BLUE }}
                  >
                    이메일이 전송중입니다...
                  </Typography>
                )}

                {/* 이메일 전송/검증 안내 메시지 */}
                {!!emailVerificationInfo &&
                  !emailVerificationInfo.startsWith("CODE_ERROR:") && (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        ml: 1,
                        display: "block",
                        color:
                          emailVerificationInfo.startsWith("CODE_SENT:") ||
                          emailVerificationInfo.startsWith("CODE_SUCCESS:")
                            ? NEW_COLOR
                            : RED_COLOR,
                      }}
                    >
                      {emailVerificationInfo
                        .replace("CODE_SENT:", "")
                        .replace("CODE_SUCCESS:", "")}
                    </Typography>
                  )}
              </Grid>

              {/* 인증 코드 입력 + 인증 버튼 */}
              {showEmailVerificationInput && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <CustomTextField
                      fullWidth
                      label="인증 코드 (6자리)"
                      name="emailVerificationCode"
                      value={emailVerificationCode}
                      onChange={(e) => setEmailVerificationCode(e.target.value.length <= 6 ? e.target.value : emailVerificationCode)}
                      disabled={isEmailVerified}
                      error={
                        !isEmailVerified &&
                        emailVerificationInfo.startsWith("CODE_ERROR")
                      }
                    />
                    <DuplicateCheckButton
                      variant="outlined"
                      onClick={handleVerifyEmailCode}
                      disabled={isEmailVerified}
                    >
                      {isEmailVerified ? "인증 완료" : "인증"}
                    </DuplicateCheckButton>
                  </Box>
                  {!isEmailVerified &&
                    emailVerificationInfo.startsWith("CODE_ERROR") && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          ml: 1,
                          display: "block",
                          color: RED_COLOR,
                        }}
                      >
                        {emailVerificationInfo.replace("CODE_ERROR:", "")}
                      </Typography>
                    )}
                </Grid>
              )}

              {/* 회원명 (readOnly) */}
              {isEmailVerified && (
                <Grid size={{ xs: 12 }}>
                  <CustomTextField
                    fullWidth
                    label="회원명"
                    name="username"
                    value={formData.username}
                    slotProps={{input: {readOnly: true }}}
                    disabled={true}
                  />
                </Grid>
              )}

              {/* 비밀번호 재설정 필드 */}
              {isEmailVerified && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      required
                      error={!!formErrors.password}
                    >
                      <InputLabel>새 비밀번호(8자 이상)</InputLabel>
                      <OutlinedInput
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword}>
                              {showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="새 비밀번호(8자 이상)"
                      />
                    </FormControl>
                    {!!formErrors.password && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          ml: 1,
                          display: "block",
                          color: RED_COLOR,
                        }}
                      >
                        {formErrors.password}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      required
                      error={!!formErrors.passwordConfirm}
                    >
                      <InputLabel>비밀번호 확인</InputLabel>
                      <OutlinedInput
                        name="passwordConfirm"
                        type={showPasswordConfirm ? "text" : "password"}
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleClickShowPasswordConfirm}
                            >
                              {showPasswordConfirm ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="비밀번호 확인"
                      />
                    </FormControl>
                    {!!formErrors.passwordConfirm && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          ml: 1,
                          display: "block",
                          color: RED_COLOR,
                        }}
                      >
                        {formErrors.passwordConfirm}
                      </Typography>
                    )}
                  </Grid>
                </>
              )}

              {/* 제출 버튼 */}
              <Grid size={{ xs: 12 }}>
                <ActionButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={!isEmailVerified}
                >
                  비밀번호 재설정
                </ActionButton>
                {!!formErrors.submit && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1, display: "block", color: RED_COLOR }}
                  >
                    {formErrors.submit}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </ResetCard>
      </Container>
    </ResetWrapper>
  );
};

export default ResetPassword;
