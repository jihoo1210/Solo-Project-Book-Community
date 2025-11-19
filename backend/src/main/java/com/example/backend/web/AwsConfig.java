package com.example.backend.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class AwsConfig {

    @Value("${cloud.aws.region}")
    private String region;

    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    /**
     * aws 자격 증명객체 생성
     * @return SDK가 사용할 수 있는 형태의 자격증명
     */
    @Bean
    public AwsCredentialsProvider credentialsProvider() {
        return StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));
    }

    /**
     * S3에 파일 업로드, 다운로드 요청을 보내는 사용자
     * @param provider 자격증명
     * @return 클라이언트 S3 객체
     */
    @Bean
    public S3Client s3Client(AwsCredentialsProvider provider) {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(provider)
                .build();
    }

    /**
     * 클라이언트가 직접 접근할 수 있는 임시 서명된 URL을 생성하는 사용자
     * @param provider 자격증명
     * @return 임시 서명된 URL을 발급받는 사용자
     */
    @Bean
    public S3Presigner s3Presigner(AwsCredentialsProvider provider) {
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(provider)
                .build();
    }
}
