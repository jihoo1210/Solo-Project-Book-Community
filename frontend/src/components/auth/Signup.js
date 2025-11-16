// src/components/Signup.js

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
import { Link, useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import apiClient from "../../api/Api-Service";
import {
  BG_COLOR,
  HEADER_HEIGHT,
  LIGHT_TEXT_COLOR,
  RED_COLOR,
  TEXT_COLOR,
  NEW_COLOR,
  AQUA_BLUE,
} from "../constants/Theme";

// 레이아웃 래퍼
const SignupWrapper = styled(Box)(({ theme }) => ({
  marginTop: HEADER_HEIGHT,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: BG_COLOR,
  padding: theme.spacing(4),
}));

// 카드 컨테이너
const SignupCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  width: "60%",
  borderRadius: (theme.shape?.borderRadius || 4) * 2,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  border: `1px solid ${TEXT_COLOR}`,
  [theme.breakpoints.down("sm")]: {
    width: "80%",
    padding: theme.spacing(3),
  },
}));

// 텍스트 필드 스타일 (오류 시 붉은색 테두리 유지)
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

// 회원가입 버튼
const ActionButton = styled(Button)(({ theme }) => ({
  color: BG_COLOR,
  backgroundColor: TEXT_COLOR,
  fontWeight: 600,
  padding: theme.spacing(1.5),
  "&:hover": { backgroundColor: LIGHT_TEXT_COLOR },
}));

// 중복검사/전송/인증 버튼
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

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [lastSentEmail, setLastSentEmail] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailVerificationInput, setShowEmailVerificationInput] =
    useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const navigate = useNavigate();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupInfos, setSignupInfos] = useState({
    email: "",
    username: "",
    password: "",
    submit: "",
  });
  const [emailVerificationInfo, setEmailVerificationInfo] = useState("");

  // 오류 상태 초기화
  const clearError = (name) => {
    setSignupInfos((prev) => ({ ...prev, [name]: "" }));
    if (name === "email") setEmailVerificationInfo("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value.replace(/\s/g, "");
    if (name === "emailVerificationCode") {
      newValue = value
        .toUpperCase()
        .replace(/[^0-9]/g, "")
        .slice(0, 6);
      setEmailVerificationCode(newValue);
      if (!emailVerificationInfo.startsWith("CODE_SENT:"))
        setEmailVerificationInfo("");
      return;
    }
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: newValue };
      if (name === "email" && value !== prev.email) {
        if (showEmailVerificationInput && value !== lastSentEmail) {
          setShowEmailVerificationInput(false);
          setEmailVerificationCode("");
          setIsEmailVerified(false);
          setEmailVerificationInfo(
            "이메일 주소가 변경되어 인증 상태가 초기화되었습니다. 다시 전송 버튼을 눌러주세요."
          );
        }
      }
      if (formData.email === lastSentEmail && formData.email !== '') {
          setShowEmailVerificationInput(true);
       }
      return updatedFormData;
    });
    if (name === "username") setIsUsernameAvailable(null);
    clearError(name);
  };

  const handleClickShowPassword = () => setShowPassword((s) => !s);

  // 이메일 전송
  const handleSendVerificationEmail = async () => {
    clearError("email");
    setEmailVerificationInfo("");
    if (!formData.email.trim()) {
      setSignupInfos((prev) => ({ ...prev, email: "이메일을 입력해 주세요." }));
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiClient.get(
        `/auth/check-email?email=${formData.email}`
      );
      const isAvailable = response.data.result.available;
      if (isAvailable) {
        setShowEmailVerificationInput(true);
        setLastSentEmail(formData.email);
        setIsEmailVerified(false);
        setEmailVerificationInfo(
          "CODE_SENT:인증 코드가 전송되었습니다. 이메일을 확인해 주세요."
        );
      } else {
        setSignupInfos((prev) => ({
          ...prev,
          email: "이미 사용 중인 이메일 주소입니다.",
        }));
      }
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        "이메일 전송 중 오류가 발생했습니다.";
      setEmailVerificationInfo(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 인증
  const handleVerifyEmailCode = async () => {
    setEmailVerificationInfo("");
    if (emailVerificationCode.length !== 6) {
      setEmailVerificationInfo("6자리의 인증 코드를 입력해야 합니다.");
      return;
    }
    try {
      const url = `/auth/verify-code?email=${formData.email}&code=${emailVerificationCode}`;
      await apiClient.get(url);
      setIsEmailVerified(true);
      setEmailVerificationInfo(
        "CODE_SUCCESS:이메일 인증이 성공적으로 완료되었습니다."
      );
    } catch {
      setIsEmailVerified(false);
      setEmailVerificationInfo("CODE_ERROR:인증 코드가 일치하지 않습니다.");
    }
  };

  // 회원명 중복 체크
  const handleDuplicateCheck = async () => {
    clearError("username");
    const currentUsername = formData.username.trim();
    if (!currentUsername) {
      setSignupInfos((prev) => ({
        ...prev,
        username: "회원명을 입력해 주세요.",
      }));
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiClient.get(
        `auth/check-username?username=${currentUsername}`
      );
      setIsUsernameAvailable(response.data.result.available);
      if (response.data.result.available) {
        setSignupInfos((prev) => ({
          ...prev,
          username: "사용 가능한 회원명입니다.",
        }));
      } else {
        setSignupInfos((prev) => ({
          ...prev,
          username: "이미 사용 중인 회원명입니다.",
        }));
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "회원명 검사 중 오류가 발생했습니다.";
      setSignupInfos((prev) => ({ ...prev, username: errorMessage }));
      setIsUsernameAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 요청
  const handleSubmit = (e) => {
    e.preventDefault();
    setSignupInfos({ email: "", username: "", password: "", submit: "" });
    let hasError = false;
    const newErrors = { email: "", username: "", password: "", submit: "" };
    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해 주세요.";
      hasError = true;
    }
    if (!formData.username.trim()) {
      newErrors.username = "회원명을 입력해 주세요.";
      hasError = true;
    } else if (isUsernameAvailable !== true) {
      newErrors.username = "회원명 중복 검사를 완료해 주세요.";
      hasError = true;
    }
    if (!formData.password.trim()) {
      newErrors.password = "비밀번호를 입력해 주세요.";
      hasError = true;
    }
    if (!isEmailVerified) {
      setEmailVerificationInfo("이메일 인증을 완료해 주세요.");
      hasError = true;
    }
    if (hasError) {
      setSignupInfos(newErrors);
      return;
    }
    apiClient
      .post("auth/signup", formData)
      .then((response) => {
        if (
          response.data &&
          response.data.result &&
          response.data.result.email
        ) {
          navigate("/auth/signin?email=" + response.data.result.email);
        } else {
          navigate("/auth/signin");
        }
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message ||
          "회원가입 처리 중 오류가 발생했습니다.";
        setSignupInfos((prev) => ({ ...prev, submit: errorMessage }));
      });
  };

  const isEmailChanged = formData.email !== lastSentEmail;
  const isVerifyButtonDisabled =
    emailVerificationCode.length !== 6 || isEmailVerified;
  const isSendButtonDisabled = isLoading || formData.email !== '' || (!isEmailChanged && isEmailVerified);

  const getEmailMessageColor = () => {
    if (!emailVerificationInfo) return RED_COLOR;
    if (isEmailVerified) return NEW_COLOR;
    if (
      emailVerificationInfo.startsWith("CODE_SENT:") ||
      emailVerificationInfo.startsWith("CODE_SUCCESS:")
    )
      return NEW_COLOR;
    return RED_COLOR;
  };

  const getCleanEmailMessage = (message) => {
    if (message.startsWith("CODE_SENT:"))
      return message.replace("CODE_SENT:", "");
    if (message.startsWith("CODE_SUCCESS:"))
      return message.replace("CODE_SUCCESS:", "");
    if (message.startsWith("CODE_ERROR:"))
      return message.replace("CODE_ERROR:", "");
    return message;
  };

  return (
    <SignupWrapper>
      <Container
        maxWidth="md"
        disableGutters
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <SignupCard elevation={0}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 4, color: TEXT_COLOR }}
          >
            회원가입
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* 이메일 입력 필드 + 전송 버튼 */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
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
                    error={!!signupInfos.email}
                  />
                  <DuplicateCheckButton
                    variant="outlined"
                    onClick={handleSendVerificationEmail}
                    disabled={isSendButtonDisabled}
                  >
                    {showEmailVerificationInput &&
                    !isEmailChanged &&
                    !isEmailVerified
                      ? "재전송"
                      : "전송"}
                  </DuplicateCheckButton>
                </Box>
                {!!signupInfos.email && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1, display: "block", color: RED_COLOR }}
                  >
                    {signupInfos.email}
                  </Typography>
                )}

                {isLoading && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1, display: "block", color: AQUA_BLUE }}
                  >
                    이메일이 전송중입니다...
                  </Typography>
                )}

                {!!emailVerificationInfo &&
                  !emailVerificationInfo.startsWith("CODE_ERROR:") && (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        ml: 1,
                        display: "block",
                        color: getEmailMessageColor(),
                      }}
                    >
                      {getCleanEmailMessage(emailVerificationInfo)}
                    </Typography>
                  )}
              </Grid>

              {/* 이메일 검증 코드 입력 필드 + 인증 버튼 */}
              {showEmailVerificationInput && !isEmailChanged && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1,
                    }}
                  >
                    <CustomTextField
                      fullWidth
                      label="인증 코드 (6자리 숫자)"
                      name="emailVerificationCode"
                      type="text"
                      value={emailVerificationCode}
                      onChange={handleChange}
                      required
                      disabled={isEmailVerified}
                      error={
                        !isEmailVerified &&
                        !!emailVerificationInfo &&
                        !emailVerificationInfo.startsWith("CODE_SENT:") &&
                        !emailVerificationInfo.startsWith("CODE_SUCCESS:")
                      }
                    />
                    <DuplicateCheckButton
                      variant="outlined"
                      onClick={handleVerifyEmailCode}
                      disabled={isVerifyButtonDisabled}
                    >
                      {isEmailVerified ? "인증 완료" : "인증"}
                    </DuplicateCheckButton>
                  </Box>
                  {!isEmailVerified &&
                    !!emailVerificationInfo &&
                    !emailVerificationInfo.startsWith("CODE_SENT:") &&
                    !emailVerificationInfo.startsWith("CODE_SUCCESS:") && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          ml: 1,
                          display: "block",
                          color: RED_COLOR,
                        }}
                      >
                        {getCleanEmailMessage(emailVerificationInfo)}
                      </Typography>
                    )}
                </Grid>
              )}

              {/* 회원명 + 중복검사 버튼 */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
                  }}
                >
                  <CustomTextField
                    fullWidth
                    label="회원명 (Username)"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    error={
                      !!signupInfos.username &&
                      signupInfos.username !== "사용 가능한 회원명입니다."
                    }
                  />
                  <DuplicateCheckButton
                    variant="outlined"
                    onClick={handleDuplicateCheck}
                    disabled={!formData.username || isLoading}
                  >
                    검사
                  </DuplicateCheckButton>
                </Box>
                {!!signupInfos.username &&
                  signupInfos.username !== "사용 가능한 회원명입니다." && (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        ml: 1,
                        display: "block",
                        color: RED_COLOR,
                      }}
                    >
                      {signupInfos.username}
                    </Typography>
                  )}
                {isUsernameAvailable &&
                  signupInfos.username === "사용 가능한 회원명입니다." && (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        ml: 1,
                        display: "block",
                        color: NEW_COLOR,
                      }}
                    >
                      {signupInfos.username}
                    </Typography>
                  )}
              </Grid>

              {/* 비밀번호 입력 필드 */}
              <Grid size={{ xs: 12 }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  required
                  error={!!signupInfos.password}
                >
                  <InputLabel sx={{ color: LIGHT_TEXT_COLOR }}>
                    비밀번호
                  </InputLabel>
                  <OutlinedInput
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    sx={{
                      "& fieldset": { borderColor: TEXT_COLOR },
                      "&:hover fieldset": { borderColor: TEXT_COLOR },
                      "&.Mui-focused fieldset": {
                        borderColor: TEXT_COLOR,
                        borderWidth: "1px",
                      },
                      "&.Mui-error fieldset": { borderColor: RED_COLOR },
                      "&.Mui-error:hover fieldset": { borderColor: RED_COLOR },
                      "&.Mui-error.Mui-focused fieldset": {
                        borderColor: RED_COLOR,
                        borderWidth: "1px",
                      },
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="비밀번호"
                  />
                </FormControl>
                {!!signupInfos.password && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1, display: "block", color: RED_COLOR }}
                  >
                    {signupInfos.password}
                  </Typography>
                )}
              </Grid>

              {/* 회원가입 제출 버튼 */}
              <Grid size={{ xs: 12 }}>
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
            sx={{ mt: 3, color: LIGHT_TEXT_COLOR }}
          >
            계정이 이미 있으신가요?
            <Link to="/auth/signin" style={{ textDecoration: "none" }}>
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
