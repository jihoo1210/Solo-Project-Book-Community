import React from "react";
import { Box, Container, Typography, Link, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { AQUA_BLUE, BG_COLOR, LIGHT_TEXT_COLOR, RED_COLOR, TEXT_COLOR } from "../constants/Theme";

// 푸터 전체 컨테이너
const ModernFooter = styled(Box)(({ theme }) => ({
  backgroundColor: BG_COLOR,
  color: TEXT_COLOR,
  borderTop: `1px solid ${TEXT_COLOR}`,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

// 주요 정보 섹션
const MainInfoSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

// 저작권 섹션
const CopyrightSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${LIGHT_TEXT_COLOR}`,
}));

// 사이트맵/개발 링크 제목
const SitemapTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  fontSize: "1rem",
  [theme.breakpoints.down("sm")]: {
    marginTop: theme.spacing(2),
  },
}));

const Footer = () => {
  // 개발 관련 링크
  const devLinks = [
    { name: "개발자 GitHub", url: "https://github.com/jihoo1210" },
    {
      name: "북 커뮤니티 (개인 프로젝트)",
      url: "https://github.com/jihoo1210/Solo-Project-Book-Community.git",
    },
    {
      name: "TODO 관리 웹 (팀 프로젝트)",
      url: "https://github.com/jihoo1210/jihoo1210-Team-Project-Todo-App.git",
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <ModernFooter component="footer">
      <Container maxWidth="xl">
        {/* 주요 정보 및 링크 섹션 */}
        <MainInfoSection>
          <Grid
            container
            spacing={4}
            justifyContent="space-between"
            alignItems="flex-start"
          >
            {/* 왼쪽 정보 */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, letterSpacing: "0.1em", mb: 1 }}
              >
                개발에 사용된 도구들
              </Typography>
              <Typography
                variant="body2"
                color={LIGHT_TEXT_COLOR}
                sx={{ lineHeight: 1.8 }}
              >
                백엔드: Java, Springboot
                <br />
                데이터베이스: H2(개발), MariaDB(배포),
                <br />
                Valkey(구 Redis), S3
                <br />
                배포: aws, 깃허브 CI/CD
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, letterSpacing: "0.1em", mb: 1 }}
              >
                -
              </Typography>
              <Typography
                variant="body2"
                color={LIGHT_TEXT_COLOR}
                sx={{ lineHeight: 1.8 }}
              >
                프론트엔드: React + (axios, Matarial UI, Tiptap Editor)
                <br />
                버전 관리: GIT
                <br />
                IDLE: Intellij, VS Code
              </Typography>
            </Grid>

            {/* 오른쪽 그룹 (사이트맵 + 개발 링크) */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Grid
                container
                spacing={{ xs: 2, md: 3 }}
                justifyContent={{ xs: "flex-start" }}
              >
                {/* 개발 및 프로젝트 링크 */}
                <Grid size={{ xs: 12 }}>
                  <SitemapTitle>개발 및 링크</SitemapTitle>
                  <Box>
                    {devLinks.map((link, index) => (
                      <Link
                        href={link.url}
                        key={index}
                        underline="hover"
                        display="block"
                        variant="body2"
                        color={TEXT_COLOR}
                        target={
                          link.url.startsWith("http") ? "_blank" : "_self"
                        }
                        rel={
                          link.url.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        sx={{
                          mb: 0.5,
                          "&:hover": { color: LIGHT_TEXT_COLOR },
                        }}
                      >
                        {link.name}
                        {index === 1 && (
                          <span>
                            [<span style={{ color: AQUA_BLUE }}>NOW</span>]
                          </span>
                        )}
                        {index === 2 && (
                          <span>
                            [<span style={{ color: RED_COLOR }}>중단됨</span>]
                          </span>
                        )}
                      </Link>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Grid
                container
                spacing={{ xs: 2, md: 3 }}
                justifyContent={{ xs: "flex-start" }}
              >
                {/* 개발 및 프로젝트 링크 */}
                <Grid size={{ xs: 12 }}>
                  <SitemapTitle>연락</SitemapTitle>
                  <Typography
                    variant="bocy2"
                    color={LIGHT_TEXT_COLOR}
                    sx={{ lineHeight: 1.8, fontSize: '.9rem' }}
                  >
                    이메일: jihoostudy1@gmail.com
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </MainInfoSection>

        {/* 저작권 섹션 */}
        <CopyrightSection>
          <Typography
            variant="body2"
            color={LIGHT_TEXT_COLOR}
            align="center"
            sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
          >
            Copyright © {currentYear} BBBB. All Rights Reserved.
          </Typography>
        </CopyrightSection>
      </Container>
    </ModernFooter>
  );
};

export default Footer;
