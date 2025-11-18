package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URL;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Service
public class S3ImageService {
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucket;

    public S3ImageService(S3Client s3Client, S3Presigner s3Presigner,
                          @Value("${cloud.aws.s3.bucket}") String bucket) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucket = bucket;
    }

    /**
     * 업로드 파일의 고유 경로 생성
     * @param originalFilename 사용자가 업로드한 원본 파일 이름
     * @return 업로드 경로 / UUID(이름 충돌 방지).확장자
     */
    public String buildKey(String originalFilename) {
        String ext = Optional.ofNullable(originalFilename)
                .filter(n -> n.contains("."))
                .map(n -> n.substring(n.lastIndexOf('.') + 1))
                .orElse("bin");
        return "uploads/" + UUID.randomUUID() + "." + ext;
    }

    /**
     * 클라이언트가 PUT 요청을 보낼 수 있는 업로드용 임시 서명된 URL 생성 및 반환
     * @param key S3에 저장할 객체의 경로
     * @param contentType 업로드할 파일의 MIME 타입
     * @param ttl URL의 유효 시간
     * @return 업로드용 임시 서명된 URL
     */
    public URL presignPutUrl(String key, String contentType, Duration ttl) {
        PutObjectRequest putReq = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();

        PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(
                PutObjectPresignRequest.builder()
                        .signatureDuration(ttl)           // 예: Duration.ofMinutes(15)
                        .putObjectRequest(putReq)
                        .build()
        );
        return presigned.url();
    }

    /**
     * 클라이언트가 GET 요청을 보냘 수 있는 임시 서명된 URL 생성 및 반환
     * @param key 조회할 객체의 경로
     * @param ttl URL 유효 시간
     * @return 조회용 임시 서명된 URL
     */
    public URL presignGetUrl(String key, Duration ttl) {
        GetObjectRequest getReq = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(
                GetObjectPresignRequest.builder()
                        .signatureDuration(ttl)           // 예: Duration.ofMinutes(30)
                        .getObjectRequest(getReq)
                        .build()
        );
        return presigned.url();
    }

    /**
     * 파일 삭제
     * @param key 삭제할 파일 경로
     */
    public void deleteFile(String key) {
        DeleteObjectRequest deleteObjectReq = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        s3Client.deleteObject(deleteObjectReq);
    }
}
