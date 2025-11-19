package com.example.backend.dto.s3;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class S3FileUploadResponse {

    private String key;
    private String uploadUrl;
    private Integer expiresInSeconds;
}
