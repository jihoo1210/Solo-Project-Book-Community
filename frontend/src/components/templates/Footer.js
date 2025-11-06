import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

// 색상 정의
const BG_COLOR = '#FFFFFF';
const TEXT_COLOR = '#000000';
const LIGHT_TEXT_COLOR = '#555555';

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
  fontSize: '1rem',
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(2),
  },
}));

const Footer = () => {
  // 사이트맵 데이터
  const sitemapItems = [
    { title: '전시', links: ['현재 전시', '지난 전시', '예정 전시'] },
    { title: '소식', links: ['공지사항', '보도자료', '이벤트'] },
    { title: '이용 안내', links: ['관람 시간', '오시는 길', 'FAQ'] },
  ];

  // 개발 관련 링크
  const devLinks = [
    { name: '개발자 GitHub', url: 'https://github.com/developer-profile' },
    { name: '프로젝트 A', url: '/project/a' },
    { name: '프로젝트 B', url: '/project/b' },
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
                sx={{ fontWeight: 700, letterSpacing: '0.1em', mb: 1 }}
              >
                BBBB
              </Typography>
              <Typography
                variant="body2"
                color={LIGHT_TEXT_COLOR}
                sx={{ lineHeight: 1.8 }}
              >
                (03058) 서울특별시 종로구 삼청로 30
                <br />
                전화: 02-3701-9500 | 팩스: 02-3701-9800
                <br />
                이메일: info@bbbb.or.kr
              </Typography>
            </Grid>

            {/* 오른쪽 그룹 (사이트맵 + 개발 링크) */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid
                container
                spacing={{ xs: 2, md: 4 }}
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              >
                {/* 사이트맵 영역 */}
                <Grid size={{ xs: 12, sm: 8, md: 8 }}>
                  <Grid container spacing={{ xs: 2, md: 4 }}>
                    {sitemapItems.map((section, index) => (
                      <Grid size={{ xs: 6, sm: 4 }} key={index}>
                        <SitemapTitle>{section.title}</SitemapTitle>
                        <Box>
                          {section.links.map((link, linkIndex) => (
                            <Link
                              href="#"
                              key={linkIndex}
                              underline="hover"
                              display="block"
                              variant="body2"
                              color={TEXT_COLOR}
                              sx={{
                                mb: 0.5,
                                '&:hover': { color: LIGHT_TEXT_COLOR },
                              }}
                            >
                              {link}
                            </Link>
                          ))}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* 개발 및 프로젝트 링크 */}
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
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
                        target={link.url.startsWith('http') ? '_blank' : '_self'}
                        rel={
                          link.url.startsWith('http')
                            ? 'noopener noreferrer'
                            : undefined
                        }
                        sx={{
                          mb: 0.5,
                          '&:hover': { color: LIGHT_TEXT_COLOR },
                        }}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </Box>
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
            sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
          >
            Copyright © {currentYear} BBBB. All Rights Reserved.
          </Typography>
        </CopyrightSection>
      </Container>
    </ModernFooter>
  );
};

export default Footer;