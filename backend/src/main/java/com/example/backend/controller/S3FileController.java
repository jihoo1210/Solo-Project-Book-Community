package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.s3.S3FileDeleteResponse;
import com.example.backend.dto.s3.S3FileGetResponse;
import com.example.backend.dto.s3.S3FileUploadResponse;
import com.example.backend.service.S3ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URL;
import java.time.Duration;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/files")
public class S3FileController {

    private final S3ImageService s3;

    /**
     * Presigned PUT URL 발급
     * @param filename 클라이언트가 업로드하려는 파일 이름
     * @param contentType MIME 타입
     * @return 업로드용 URL
     */
    // (1) 업로드용 Presigned PUT URL 발급
    @PostMapping("/presign-upload")
    public ResponseEntity<?> presignUpload(@RequestParam("filename") String filename,
                                             @RequestParam("contentType") String contentType) {
        try {
            String key = s3.buildKey(filename);
            URL url = s3.presignPutUrl(key, contentType, Duration.ofMinutes(15));
            S3FileUploadResponse responseDto = S3FileUploadResponse.builder()
                .key(key)
                .uploadUrl(url.toString())
                .expiresInSeconds(15 * 60)
                .build();
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 특정 파일 키를 받아서 Presigned GET URL 발급
     * @param key 조회할 객체의 경로
     * @return 조회용 URL
     */
    // (2) 조회용 Presigned GET URL로 리다이렉트 (에디터 HTML에는 이 앱 URL을 저장)
    @GetMapping("/url")
    public ResponseEntity<?> getFileUrl(@RequestParam String key) {
        try {
            URL url = s3.presignGetUrl(key, Duration.ofMinutes(30));
            S3FileGetResponse responseDto = S3FileGetResponse.builder()
                    .url(url.toString())
                    .expiresInSeconds(30 * 60)
                    .build();
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteFile(@RequestParam String key) {
        try {
            s3.deleteFile(key);
            S3FileDeleteResponse responseDto = S3FileDeleteResponse.builder().key(key).build();
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }
}
