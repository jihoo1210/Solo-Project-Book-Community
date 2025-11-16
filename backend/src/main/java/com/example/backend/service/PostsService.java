package com.example.backend.service;

import com.example.backend.dto.comment.CommentResponse;
import com.example.backend.dto.likes.LikesResponse;
import com.example.backend.dto.posts.create.PostsCreateRequest;
import com.example.backend.dto.posts.delete.PostsDeleteResponse;
import com.example.backend.dto.posts.index.PostsIndexResponse;
import com.example.backend.dto.posts.show.PostsShowResponse;
import com.example.backend.dto.posts.update.PostsUpdateRequest;
import com.example.backend.entity.*;
import com.example.backend.entity.utilities.PostsSubject;
import com.example.backend.repository.*;
import com.example.backend.service.utilities.PostLikesSpec;
import com.example.backend.service.utilities.PostSearchSpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static com.example.backend.entity.utilities.AlertSubject.*;
import static com.example.backend.entity.utilities.PostsSubject.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class PostsService {

    private final PostsRepository repository;
    private final UserRepository userRepository; // 현재 코드에서 사용되지 않지만, 의존성 관리를 위해 유지
    private final PostsLikesRepository postsLikesRepository;
    private final CommentLikesRepository commentLikesRepository;
    private final PostsViewedRepository postsViewedRepository;
    private final AlertRepository alertRepository;
    private final ChatRoomService chatRoomService;

    /**
     * 전체 게시글 목록을 검색 조건과 페이징 조건에 따라 조회합니다.
     *
     * @param user 현재 로그인된 사용자 정보 (좋아요 여부 확인용)
     * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
     * @param searchField 검색 필드 (예: title, content, username)
     * @param searchTerm 검색어
     * @param tab 주제별 탭 필터
     * @return 검색 및 페이징 처리된 게시글 목록 DTO
     */
    public Page<PostsIndexResponse> index(User user,
                                          Pageable pageable,
                                          String searchField,
                                          String searchTerm,
                                          Integer tab) {

        // 1. 검색 조건(Specification) 생성 (모든 사용자 게시글 대상)
        Specification<Posts> spec = PostSearchSpec.search(null, searchField, searchTerm, tab);

        // 2. 검색 조건(spec)과 페이징 조건(pageable)을 함께 Repository에 전달하여 조회
        Page<Posts> postPage = repository.findAll(spec, pageable);

        // 3. 조회된 Page<Posts>를 Page<PostsIndexResponse>로 변환
        return postPage.map(post -> PostsIndexResponse.builder()
                .id(post.getId())
                .subject(post.getSubject().getSubject())
                .title(post.getTitle())
                .username(post.getUser().getUsername())
                .createdDate(post.getCreatedDate())
                .modifiedDate(post.getModifiedDate())
                .likes(post.getLikes().size())
                .commentNumber(post.getComments().size())
                // 현재 사용자의 게시글 좋아요 여부를 확인하여 포함
                .savedInLikes(postsLikesRepository.existsByUserAndPosts(user, post))
                .viewCount(post.getViewCount())
                .savedInViews(postsViewedRepository.existsByUserAndPosts(user, post))
                .build());
    }

    /**
     * 특정 사용자의 게시글 목록을 검색 조건과 페이징 조건에 따라 조회합니다.
     *
     * @param user 현재 로그인된 사용자 (좋아요 여부 확인 및 대상 사용자 지정)
     * @param pageable 페이징 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색어
     * @param tab 주제별 탭 필터
     * @return 검색 및 페이징 처리된 해당 사용자의 게시글 목록 DTO
     */
    public Page<PostsIndexResponse> indexByUser(User user, Pageable pageable, String searchField, String searchTerm, Integer tab) {

        // 1. 검색 조건(Specification) 생성 (특정 사용자 게시글 대상)
        Specification<Posts> spec = PostSearchSpec.search(user, searchField, searchTerm, tab);

        // 2. 검색 조건(spec)과 페이징 조건(pageable)을 함께 Repository에 전달하여 조회
        Page<Posts> postPage = repository.findAll(spec, pageable);

        // 3. 조회된 Page<Posts>를 Page<PostsIndexResponse>로 변환
        return postPage.map(post -> PostsIndexResponse.builder()
                .id(post.getId())
                .subject(post.getSubject().getSubject())
                .title(post.getTitle())
                .username(post.getUser().getUsername())
                .createdDate(post.getCreatedDate())
                .modifiedDate(post.getModifiedDate())
                .likes(post.getLikes().size())
                .commentNumber(post.getComments().size())
                // 현재 사용자의 게시글 좋아요 여부를 확인하여 포함
                .savedInLikes(postsLikesRepository.existsByUserAndPosts(user, post))
                .viewCount(post.getViewCount())
                .savedInViews(postsViewedRepository.existsByUserAndPosts(user, post))
                .build());
    }

    public Page<PostsIndexResponse> indexFavoriteByUser(User user, Pageable pageable, String searchField, String searchTerm, Integer tab) {
        Specification<PostsLikes> spec = PostLikesSpec.search(user, searchField, searchTerm, tab);

        Page<PostsLikes> postsLikesPage = postsLikesRepository.findAll(spec, pageable);

        return postsLikesPage.map(postsLikes -> PostsIndexResponse.builder()
                .id(postsLikes.getPosts().getId())
                .subject(postsLikes.getPosts().getSubject().getSubject())
                .title(postsLikes.getPosts().getTitle())
                .username(postsLikes.getPosts().getUser().getUsername())
                .createdDate(postsLikes.getPosts().getCreatedDate())
                .modifiedDate(postsLikes.getPosts().getModifiedDate())
                .likes(postsLikes.getPosts().getLikes().size())
                .commentNumber(postsLikes.getPosts().getComments().size())
                // 현재 사용자의 게시글 좋아요 여부를 확인하여 포함
                .savedInLikes(postsLikesRepository.existsByUserAndPosts(user, postsLikes.getPosts()))
                .viewCount(postsLikes.getPosts().getViewCount())
                .savedInViews(postsViewedRepository.existsByUserAndPosts(user, postsLikes.getPosts()))
                .build());
    }

    /**
     * 특정 게시글을 상세 조회하고, 조회수를 1 증가시킵니다.
     *
     * @param user 현재 로그인된 사용자 정보 (좋아요 여부 확인용)
     * @param postsId 조회할 게시글 ID
     * @return 게시글 상세 정보 및 댓글 목록이 포함된 DTO
     * @throws IllegalArgumentException 해당 게시글이 존재하지 않을 경우
     */
    @Transactional
    public PostsShowResponse show(User user, Long postsId) {
        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

        // 조회수 증가
        target.setViewCount(target.getViewCount() + 1);

        // 댓글 목록을 DTO로 변환하고, 각 댓글의 좋아요 여부를 확인
        List<CommentResponse> comments = target.getComments().stream().map(comment -> CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .username(comment.getUser().getUsername())
                .likes(comment.getLikes().size())
                .savedInLikes(commentLikesRepository.existsByUserAndComment(user, comment))
                .createdDate(comment.getCreatedDate())
                .modifiedDate(comment.getModifiedDate())
                .build()).toList();

        if(!postsViewedRepository.existsByUserAndPosts(user, target)) {
            PostsViewed postsViewed = PostsViewed.builder()
                    .user(user)
                    .posts(target)
                    .build();
            postsViewedRepository.save(postsViewed);
        }
        Alert alertToRecruitmentResult = alertRepository.findByPostsAndSenderAndSubject(target, user, APPLICATION)
                .orElse(alertRepository.findByPostsAndSenderAndSubject(target, user, APPROVAL)
                        .orElse(alertRepository.findByPostsAndSenderAndSubject(target, user, REJECTED)
                                .orElse(null)));

        // 게시글 상세 정보를 DTO로 빌드
        return PostsShowResponse.builder()
                .id(target.getId())
                .subject(target.getSubject().getSubject())
                .title(target.getTitle())
                .content(target.getContent())
                .username(target.getUser().getUsername())
                .modifiedDate(target.getModifiedDate())
                .createdDate(target.getCreatedDate())
                .likes(target.getLikes().size())
                // 현재 사용자의 게시글 좋아요 여부
                .savedInLikes(postsLikesRepository.existsByUserAndPosts(user, target))
                .viewCount(target.getViewCount())
                .comments(comments)
                // 주제별 추가 정보 (모집, 질문)
                .region(target.getRegion())
                .meetingInfo(target.getMeetingInfo())
                .maxUserNumber(target.getMaxUserNumber())
                .currentUserNumber(target.getCurrentUserNumber() != null ? target.getCurrentUserNumber() : 0)
                // 모임 신청 결과
                .recruitmentResult(alertToRecruitmentResult != null ? alertToRecruitmentResult.getSubject().getSubject() : null)
                .bookTitle(target.getBookTitle())
                .pageNumber(target.getPageNumber())
                .adoptedCommentId(target.getAdoptedComment() != null ? target.getAdoptedComment().getId() : null)
                .build();
    }

    /**
     * 게시글에 대한 좋아요 등록 및 취소 처리를 수행합니다.
     * 이미 좋아요 상태면 취소하고, 아니면 등록합니다.
     *
     * @param postsId 좋아요 처리할 게시글 ID
     * @param user 좋아요를 요청한 사용자
     * @return 좋아요 처리 결과 DTO (좋아요 등록/취소 여부 포함)
     * @throws IllegalArgumentException 해당 게시글이 존재하지 않을 경우
     */
    @Transactional
    public LikesResponse handleLikes(Long postsId, User user) {
        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

        // 좋아요 상태 확인: 이미 좋아요가 되어 있을 때 (좋아요 취소)
        if(postsLikesRepository.existsByUserAndPosts(user, target)) {
            log.warn("User {} already liked post {}", user.getId(), postsId);
            PostsLikes removedTarget = postsLikesRepository.findByUserAndPosts(user, target)
                    .orElseThrow(() -> new IllegalArgumentException("좋아요 정보가 존재하지 않습니다."));
            postsLikesRepository.delete(removedTarget);

            // 좋아요를 취소했으므로 'savedInLikes'는 false
            return LikesResponse.builder()
                    .savedInLikes(false)
                    .build();
        }

        // 좋아요 상태 확인: 좋아요가 되어있지 않았을 때 (좋아요 등록)
        PostsLikes likes = PostsLikes.builder()
                .user(user)
                .posts(target)
                .build();
        postsLikesRepository.save(likes);

        log.info("User {} successfully liked post {}", user.getId(), postsId);
        // 좋아요를 등록했으므로 'savedInLikes'는 true
        return LikesResponse.builder()
                .savedInLikes(true)
                .build();
    }

    /**
     * 새로운 게시글을 생성하고 저장합니다.
     *
     * @param dto 게시글 생성 요청 DTO
     * @param user 현재 로그인된 사용자 (작성자)
     */
    @Transactional
    public void create(PostsCreateRequest dto, User user) {
        log.info("게시글 생성 요청: {}", dto);

        // 요청 DTO의 subject 문자열을 PostsSubject Enum으로 변환
        PostsSubject dtoSubjectToEnum = switch (dto.getSubject()) {
            case "질문" -> QUESTION;
            case "모집" -> RECRUIT;
            default -> SHARE; // 기본값은 '공유'
        };

        // Posts 엔티티 생성 및 사용자 정보, 주제별 정보 설정
        Posts target = Posts.builder()
                .subject(dtoSubjectToEnum)
                .title(dto.getTitle())
                .content(dto.getContent())
                .bookTitle(dto.getBookTitle())
                .pageNumber(dto.getPageNumber())
                .region(dto.getRegion())
                .meetingInfo(dto.getMeetingInfo())
                .maxUserNumber(dto.getMaxUserNumber())
                .user(user)
                .build();

        // 웹 소켓 생성
        if(target.getSubject().equals(RECRUIT)) {
            List<Long> invitedUserIds = new ArrayList<>();
            invitedUserIds.add(user.getId());
            chatRoomService.createRoom(target.getTitle(), user, invitedUserIds);
        }

        repository.save(target);
    }

    /**
     * 기존 게시글을 수정합니다. (작성자 권한 검증 포함)
     *
     * @param postsId 수정할 게시글 ID
     * @param dto 게시글 수정 요청 DTO
     * @param user 현재 로그인된 사용자
     * @return 수정된 게시글 정보 DTO
     * @throws IllegalArgumentException 해당 게시글이 존재하지 않을 경우
     * @throws IllegalAccessException 현재 사용자가 게시글 작성자가 아닐 경우
     */
    @Transactional
    public void update(Long postsId, PostsUpdateRequest dto, User user) throws IllegalAccessException {
        log.info("게시글 ID: {}, 수정 요청 DTO: {}", postsId, dto);

        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

        // 작성자 권한 검증
        // if(!target.getUser().equals(user)) throw new IllegalAccessException("다른 사용자의 글을 수정할 수 없습니다.");

        // 요청 DTO의 subject 문자열을 PostsSubject Enum으로 변환
        PostsSubject dtoSubjectToEnum = switch (dto.getSubject()) {
            case "질문" -> QUESTION;
            case "모집" -> RECRUIT;
            default -> SHARE; // 기본값은 '공유'
        };

        // 엔티티 필드 업데이트
        target.setSubject(dtoSubjectToEnum);
        target.setTitle(dto.getTitle());
        target.setContent(dto.getContent());
        target.setRegion(dto.getRegion());
        target.setMeetingInfo(dto.getMeetingInfo());
        target.setBookTitle(dto.getBookTitle());
        target.setPageNumber(dto.getPageNumber());
        target.setModifiedDate(LocalDateTime.now());
        if (dto.getMaxUserNumber() != null) {
            if (dto.getMaxUserNumber() >= target.getCurrentUserNumber()) {
                target.setMaxUserNumber(dto.getMaxUserNumber());
            }
            else {
                throw new IllegalArgumentException("현재 모집된 인원수보다 최대 인원수가 더 적을 수 없습니다.");
            }
        }
    }

    /**
     * 게시글을 삭제합니다. (작성자 권한 검증 포함)
     *
     * @param postsId 삭제할 게시글 ID
     * @param user 현재 로그인된 사용자
     * @return 삭제된 게시글 ID가 포함된 DTO
     * @throws IllegalAccessException 해당 게시글이 존재하지 않거나, 현재 사용자가 작성자가 아닐 경우
     */
    @Transactional
    public PostsDeleteResponse delete(Long postsId, User user) throws IllegalAccessException {
        log.info("게시글 ID: {} 삭제 요청", postsId);

        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalAccessException("해당 게시글이 존재하지 않습니다."));

        // 작성자 권한 검증
        // 오류 발생 -> userDetails에서 가져온 user는 <비영속>, 데이터베이스에서 조회된 user는 <영속> 상태임
        // if(!user.equals(target.getUser())) throw new IllegalAccessException("다른 사용자의 글을 삭제할 수 없습니다.");

        repository.delete(target);

        // 삭제된 게시글 ID 반환
        return PostsDeleteResponse.builder()
                .id(target.getId())
                .build();
    }
}