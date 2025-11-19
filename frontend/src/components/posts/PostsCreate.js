// src/components/PostsCreate.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import TiptapEditor from "../utilities/TiptabEditor";
import { useAuth } from "../auth/AuthContext";
import apiClient from "../../api/Api-Service";

import { sanitizeContentImages, extractImageKeys } from "../utilities/EditorUtils";
import { deleteFiles } from "../utilities/FileApi";

const BG_COLOR = "#FFFFFF";
const TEXT_COLOR = "#000000";
const LIGHT_TEXT_COLOR = "#555555";
const HEADER_HEIGHT = "64px";

const CreateWrapper = styled(Box)(({ theme }) => ({
  marginTop: HEADER_HEIGHT,
  backgroundColor: BG_COLOR,
  padding: theme.spacing(4, 0),
  display: "flex",
  justifyContent: "center",
}));

const CreateCard = styled(Paper)(({ theme }) => ({
  maxWidth: "100%",
  padding: theme.spacing(5),
  borderRadius: (theme.shape?.borderRadius || 4) * 2,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  border: `1px solid ${TEXT_COLOR}`,
  backgroundColor: BG_COLOR,

  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
  },
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputLabel-root": {
    color: LIGHT_TEXT_COLOR,
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: TEXT_COLOR,
    },
    "&:hover fieldset": {
      borderColor: TEXT_COLOR,
    },
    "&.Mui-focused fieldset": {
      borderColor: TEXT_COLOR,
      borderWidth: "1px",
    },
    "&.Mui-disabled fieldset": {
      borderColor: `${TEXT_COLOR} !important`,
    },
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: TEXT_COLOR,
    },
  },
  "& .MuiInputLabel-root.Mui-disabled": {
    color: `${LIGHT_TEXT_COLOR} !important`,
  },
  "& .MuiInputLabel-root.Mui-error": {
    color: `${theme.palette.error.main} !important`,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  color: BG_COLOR,
  backgroundColor: TEXT_COLOR,
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  minWidth: "120px",
  "&:hover": { backgroundColor: LIGHT_TEXT_COLOR },
}));

const DisabledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root.Mui-disabled": {
    backgroundColor: alpha(LIGHT_TEXT_COLOR, 0.1),
    color: TEXT_COLOR,
  },
}));

const PostsCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadedKeys, setUploadedKeys] = useState([]);

  useEffect(() => {
    return () => {};
  }, []);

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  const currentDateTimeText = getCurrentDateTime();

  const [formData, setFormData] = useState({
    subject: "공유",
    title: "",
    bookTitle: "",
    pageNumber: "",
    region: "",
    dayInput: "",
    maxUserNumber: "",
  });

  const [contentHtml, setContentHtml] = useState("");

  const onContentChange = (newHtml) => {
    setContentHtml(newHtml);
    const strippedContent = newHtml.replace(/(<([^>]+)>)/gi, "").trim();
    if (strippedContent !== "") {
      setFieldErrors((prev) => ({ ...prev, content: undefined }));
    }
  };

  const showQuestionFields = formData.subject === "질문";
  const showRecruitmentFields = formData.subject === "모집";

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "pageNumber" || name === "maxUserNumber") {
      value = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value.trim() !== "") {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = {};
    let hasError = false;

    if (formData.title.trim() === "") {
      errors.title = "게시글 제목을 입력해야 합니다.";
      hasError = true;
    }

    const strippedContent = contentHtml.replace(/(<([^>]+)>)/gi, "").trim();
    if (!strippedContent) {
      errors.content = "내용을 입력해야 합니다.";
      hasError = true;
    }

    if (showQuestionFields) {
      if (formData.bookTitle.trim() === "") {
        errors.bookTitle = "책 제목을 입력해야 합니다.";
        hasError = true;
      }
      if (formData.pageNumber.trim() === "") {
        errors.pageNumber = "페이지 번호를 입력해야 합니다.";
        hasError = true;
      }
    }

    if (showRecruitmentFields) {
      if (formData.region.trim() === "") {
        errors.region = "모임 지역을 입력해야 합니다.";
        hasError = true;
      }
      if (formData.dayInput.trim() === "") {
        errors.dayInput = "모임 일정을 입력해야 합니다.";
        hasError = true;
      }
      if (formData.maxUserNumber.trim() === "" || parseInt(formData.maxUserNumber) <= 0) {
        errors.maxUserNumber = "모집 인원수를 1명 이상 입력해야 합니다.";
        hasError = true;
      }
    }

    setFieldErrors(errors);
    if (hasError) return;

    // 현재 에디터에 남아있는 data-key 목록
    const currentKeys = extractImageKeys(contentHtml);
    // 업로드된 키 중 에디터에 없는 키들 제거
    const unusedKeys = uploadedKeys.filter((k) => !currentKeys.includes(k));

    if (unusedKeys.length > 0) {
      try {
        await deleteFiles(unusedKeys);
      } catch (err) {
        console.error('불필요 이미지 삭제 실패:', err);
      }
    }

    const dataToSubmit = {
      title: formData.title,
      content: sanitizeContentImages(contentHtml),
      subject: formData.subject,
      ...(showQuestionFields && {
        bookTitle: formData.bookTitle,
        pageNumber: formData.pageNumber,
      }),
      ...(showRecruitmentFields && {
        region: formData.region,
        meetingInfo: formData.dayInput,
        maxUserNumber: formData.maxUserNumber,
      }),
    };

    try {
      await apiClient.post("/posts", dataToSubmit);
      navigate("/");
    } catch (error) {
      console.log("error.response.data.message", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  const AuthorAndSubjectGrid = (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth variant="outlined">
          <InputLabel id="subject-label" sx={{ color: LIGHT_TEXT_COLOR }}>
            게시판
          </InputLabel>
          <Select
            labelId="subject-label"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            label="게시판"
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { borderColor: TEXT_COLOR },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEXT_COLOR },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: TEXT_COLOR, borderWidth: "1px" },
              color: TEXT_COLOR,
            }}
          >
            <MenuItem value={"질문"}>질문</MenuItem>
            <MenuItem value={"공유"}>공유</MenuItem>
            <MenuItem value={"모집"}>모집</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <DisabledTextField
          fullWidth
          label="작성자"
          value={user ? user.username : "로그인 필요"}
          variant="outlined"
          disabled
        />
      </Grid>
    </>
  );

  const TitleGrid = (
    <Grid size={{ xs: 12 }}>
      <CustomTextField
        fullWidth
        label="게시글 제목"
        name="title"
        value={formData.title}
        onChange={handleChange}
        variant="outlined"
        error={!!fieldErrors.title}
        helperText={fieldErrors.title}
      />
    </Grid>
  );

  const QuestionFields = (
    <Grid size={{ xs: 12 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="책 제목"
            name="bookTitle"
            value={formData.bookTitle}
            onChange={handleChange}
            variant="outlined"
            error={!!fieldErrors.bookTitle}
            helperText={fieldErrors.bookTitle}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="페이지 번호 (숫자만)"
            name="pageNumber"
            value={formData.pageNumber}
            onChange={handleChange}
            variant="outlined"
            error={!!fieldErrors.pageNumber}
            helperText={fieldErrors.pageNumber}
          />
        </Grid>
      </Grid>
    </Grid>
  );

  const RecruitmentFields = (
    <Grid size={{ xs: 12 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomTextField
            fullWidth
            label="지역"
            name="region"
            value={formData.region}
            onChange={handleChange}
            variant="outlined"
            error={!!fieldErrors.region}
            helperText={fieldErrors.region}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 9 }}>
          <CustomTextField
            fullWidth
            label="모임 일정 (예: 매주 토요일 오후 2시)"
            name="dayInput"
            value={formData.dayInput}
            onChange={handleChange}
            variant="outlined"
            error={!!fieldErrors.dayInput}
            helperText={fieldErrors.dayInput}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <CustomTextField
            fullWidth
            label="모집 인원수 (숫자만)"
            name="maxUserNumber"
            value={formData.maxUserNumber}
            onChange={handleChange}
            variant="outlined"
            slotProps={{ input: { inputMode: "numeric", pattern: "[0-9]*" } }}
            error={!!fieldErrors.maxUserNumber}
            helperText={fieldErrors.maxUserNumber}
          />
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <CreateWrapper>
      <Container maxWidth="lg">
        <Box
          sx={(theme) => ({
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: "0px !important",
            [theme.breakpoints.down("sm")]: {
              paddingX: theme.spacing(2),
            },
          })}
        >
          <Button
            component={Link}
            to={"/"}
            startIcon={<ArrowBackIcon />}
            sx={{ color: TEXT_COLOR, "&:hover": { backgroundColor: alpha(TEXT_COLOR, 0.05) } }}
          >
            목록으로
          </Button>
        </Box>
        <CreateCard elevation={0}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {AuthorAndSubjectGrid}

              {TitleGrid}

              {showQuestionFields && QuestionFields}

              {showRecruitmentFields && RecruitmentFields}

              <Grid size={{ xs: 12 }}>
                <InputLabel
                  sx={{
                    color: fieldErrors.content ? "error.main" : LIGHT_TEXT_COLOR,
                    position: "relative",
                    transform: "none",
                    marginBottom: "8px",
                    fontSize: "1rem",
                    fontWeight: 400,
                  }}
                >
                  내용
                </InputLabel>

                <TiptapEditor
                  initialContent={contentHtml}
                  onContentChange={onContentChange}
                  placeholderText="내용을 입력하세요..."
                  error={!!fieldErrors.content}
                  onUploadedKeysChange={(updater) =>
                    setUploadedKeys((prev) => (typeof updater === 'function' ? updater(prev) : updater))
                  }
                />

                {fieldErrors.content && (
                  <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                    {fieldErrors.content}
                  </Typography>
                )}

                <Typography
                  variant="caption"
                  align="right"
                  display="block"
                  sx={{ mt: 0.5, color: LIGHT_TEXT_COLOR, fontSize: "0.75rem" }}
                >
                  {currentDateTimeText}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                  <ActionButton type="submit" variant="contained">
                    작성 완료
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

export default PostsCreate;
