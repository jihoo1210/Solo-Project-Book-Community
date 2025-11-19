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
import { Link, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import TiptapEditor from "../utilities/TiptabEditor";
import apiClient from "../../api/Api-Service";

import { sanitizeContentImages, extractImageKeys, restoreImageSrc } from "../utilities/EditorUtils";
import { deleteFiles } from "../utilities/FileApi";

const BG_COLOR = "#FFFFFF";
const TEXT_COLOR = "#000000";
const LIGHT_TEXT_COLOR = "#555555";
const HEADER_HEIGHT = "64px";

const CreateWrapper = styled(Box)(({ theme }) => ({
  marginTop: HEADER_HEIGHT,
  minHeight: `calc(100vh - ${HEADER_HEIGHT} - 150px)`,
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

const DisabledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root.Mui-disabled": {
    backgroundColor: alpha(LIGHT_TEXT_COLOR, 0.1),
    color: TEXT_COLOR,
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

const PostEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentHtml, setContentHtml] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadedKeys, setUploadedKeys] = useState([]);

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchPostDetails = async () => {
      try {
        const response = await apiClient.get(`/posts/${id}`);
        const postData = response.data.result;

        if (postData) {
          const restoredContent = await restoreImageSrc(postData.content || '');
          setPost({
            ...postData,
            maxUserNumber: postData.maxUserNumber?.toString() || "",
            meetingInfo: postData.meetingInfo || "",
          });
          setContentHtml(restoredContent || "");
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error("게시글 로딩 실패:", error);
        setPost(null);
        setContentHtml("");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPostDetails();
  }, [id]);

  const onContentChange = (newHtml) => {
    setContentHtml(newHtml);
    const strippedContent = newHtml.replace(/(<([^>]+)>)/gi, "").trim();
    if (strippedContent !== "") {
      setFieldErrors((prev) => ({ ...prev, content: undefined }));
    }
  };

  const author = post ? post.username : "불러오는 중...";
  const currentDateTimeText = post ? `${getCurrentDateTime()}` : "정보 없음";

  if (isLoading || !post) {
    return (
      <CreateWrapper>
        <Container maxWidth="lg">
          <Typography variant="h5" align="center" color={LIGHT_TEXT_COLOR}>
            게시글을 불러오는 중...
          </Typography>
        </Container>
      </CreateWrapper>
    );
  }

  const showQuestionFields = post.subject === "질문";
  const showRecruitmentFields = post.subject === "모집";

  const handleChange = (e) => {
    let { name, value } = e.target;
    const prevPost = post;

    if (name === "pageNumber" || name === "maxUserNumber") {
      value = value.replace(/[^0-9]/g, "");
    }

    if (name === "subject") {
      if (prevPost.subject !== value) {
        if (!window.confirm("정말 게시글 종류를 바꾸시겠습니까?")) {
          e.preventDefault();
          return;
        }
      }

      setPost({
        ...prevPost,
        subject: value,
        bookTitle: "",
        pageNumber: "",
        region: "",
        meetingInfo: "",
        maxUserNumber: "",
      });
    } else {
      setPost((prev) => ({ ...prev, [name]: value }));
    }

    if (value.trim() !== "") {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    let errors = {};
    let hasError = false;

    if (post.title.trim() === "") {
      errors.title = "게시글 제목을 입력해야 합니다.";
      hasError = true;
    }

    const strippedContent = contentHtml.replace(/(<([^>]+)>)/gi, "").trim();
    if (!strippedContent) {
      errors.content = "내용을 입력해야 합니다.";
      hasError = true;
    }

    if (showQuestionFields) {
      if (post.bookTitle.trim() === "") {
        errors.bookTitle = "책 제목을 입력해야 합니다.";
        hasError = true;
      }
      if (post.pageNumber === "") {
        errors.pageNumber = "페이지 번호를 입력해야 합니다.";
        hasError = true;
      }
    }

    if (showRecruitmentFields) {
      if (post.region.trim() === "") {
        errors.region = "모임 지역을 입력해야 합니다.";
        hasError = true;
      }
      if (post.meetingInfo.trim() === "") {
        errors.meetingInfo = "모임 일정을 입력해야 합니다.";
        hasError = true;
      }
      if (post.maxUserNumber === "" || parseInt(post.maxUserNumber) <= 0) {
        errors.maxUserNumber = "모집 인원수를 1명 이상 입력해야 합니다.";
        hasError = true;
      }
    }

    setFieldErrors(errors);
    if (hasError) return;

    // 현재 에디터에 남아있는 data-key 목록
    const currentKeys = extractImageKeys(contentHtml);
    const unusedKeys = uploadedKeys.filter((k) => !currentKeys.includes(k));

    if (unusedKeys.length > 0) {
      try {
        await deleteFiles(unusedKeys);
      } catch (err) {
        console.error('불필요 이미지 삭제 실패:', err);
      }
    }

    if (window.confirm("게시글을 수정하시겠습니까?")) {
      const dataToUpdate = {
        id: id,
        subject: post.subject,
        title: post.title,
        content: sanitizeContentImages(contentHtml),
        ...(showQuestionFields && {
          bookTitle: post.bookTitle,
          pageNumber: post.pageNumber,
        }),
        ...(showRecruitmentFields && {
          region: post.region,
          meetingInfo: post.meetingInfo,
          maxUserNumber: post.maxUserNumber,
        }),
      };

      try {
        await apiClient.patch(`/posts/${id}`, dataToUpdate);
        navigate(`/post/${id}`);
      } catch (error) {
        console.error("게시글 수정 실패:", error);
        const message =
          error.response?.data?.message ||
          "게시글 수정에 실패했습니다. 다시 시도해 주세요.";
        alert(message);
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
            value={post.subject}
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
        <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5, fontSize: "0.7rem", fontWeight: 600 }}>
          주의! 게시글의 종류를 바꾸면 이전의 내용과 제목을 제외한 모든 정보가 초기화 됩니다.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <DisabledTextField
          fullWidth
          label="작성자"
          name="author"
          value={author}
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
        value={post.title}
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
            value={post.bookTitle}
            onChange={handleChange}
            variant="outlined"
            error={!!fieldErrors.bookTitle}
            helperText={fieldErrors.bookTitle}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            fullWidth
            label="페이지 번호"
            name="pageNumber"
            value={post.pageNumber}
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
            value={post.region}
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
            name="meetingInfo"
            value={post.meetingInfo}
            onChange={handleChange}
            variant="outlined"
            error={!!fieldErrors.meetingInfo}
            helperText={fieldErrors.meetingInfo}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <CustomTextField
            fullWidth
            label="모집 인원수 (숫자만)"
            name="maxUserNumber"
            value={post.maxUserNumber}
            onChange={handleChange}
            variant="outlined"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
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
          <Typography variant="h5" align="left" gutterBottom sx={{ fontWeight: 700, mb: 4, color: TEXT_COLOR }}>
            게시글 수정 (ID: {id})
          </Typography>

          <form onSubmit={handleUpdate}>
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
                  <Button
                    variant="outlined"
                    component={Link}
                    to={`/post/${id}`}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      color: TEXT_COLOR,
                      borderColor: TEXT_COLOR,
                      fontWeight: 600,
                      "&:hover": { borderColor: TEXT_COLOR, backgroundColor: alpha(TEXT_COLOR, 0.05) },
                    }}
                  >
                    취소
                  </Button>
                  <ActionButton type="submit" variant="contained">
                    수정 완료
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

export default PostEdit;
