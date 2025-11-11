// src/utils/dateUtils.js

/**
 * MM/DD HH:MM 포맷으로 반환합니다. (PostsDetail에서 사용)
 * @param {string} dateString 포매팅할 날짜 문자열
 * @returns {string} 포매팅된 날짜 문자열
 */
export const formatFullDate = (dateString) => {
    if (!dateString) return '';
    const postDate = new Date(dateString);
    const month = String(postDate.getMonth() + 1).padStart(2, '0');
    const day = String(postDate.getDate()).padStart(2, '0');
    const hours = String(postDate.getHours()).padStart(2, '0');
    const minutes = String(postDate.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
};

/**
 * 게시글 날짜를 조건부로 포매팅하는 함수 (오늘: HH:MM, 그 외: MM/DD) (PostsList, MyActives 등에서 사용)
 * 💡 수정: 날짜 비교 로직을 수정하여 올바르게 작동하도록 했습니다.
 * @param {string} dateString 포매팅할 날짜 문자열
 * @returns {string} 포매팅된 시간 또는 날짜 문자열
 */
export const formatTimeOrDate = (dateString) => {
    if (!dateString) return '';
    const postDate = new Date(dateString);
    const today = new Date();

    // 날짜 비교를 위해 시, 분, 초, 밀리초를 0으로 설정하여 날짜(Day)만 비교
    const postDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()); 

    // 1. 날짜가 오늘과 같을 경우: "시간:분" (예: 10:05)
    if (postDay.getTime() === todayDay.getTime()) {
        const hours = String(postDate.getHours()).padStart(2, '0');
        const minutes = String(postDate.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    // 2. 날짜가 오늘과 다를 경우: "월/일" (예: 11/04)
    else {
        const month = String(postDate.getMonth() + 1).padStart(2, '0');
        const day = String(postDate.getDate()).padStart(2, '0');
        return `${month}/${day}`;
    }
};

/**
 * createdDate와 modifiedDate를 비교하여 표시할 날짜 문자열과 수정 여부를 반환합니다.
 * @param {string} modifiedDateString 수정 날짜 문자열
 * @param {string} createdDateString 생성 날짜 문자열
 * @param {boolean} useFullDate MM/DD HH:MM 포맷 사용 여부 (true면 formatFullDate 사용, false면 formatTimeOrDate 사용)
 * @returns {{ dateDisplay: string, isModified: boolean }} 표시할 날짜 정보와 수정 여부
 */
export const getPostDateInfo = (modifiedDateString, createdDateString, useFullDate = false) => {
    if (!createdDateString) {
        return { dateDisplay: '', isModified: false };
    }

    const createdDate = new Date(createdDateString);
    const modifiedDate = modifiedDateString ? new Date(modifiedDateString) : createdDate;

    // modifiedDate가 createdDate보다 1초 이상 이후인 경우에만 수정된 것으로 간주
    const isModified = modifiedDateString && modifiedDate.getTime() > createdDate.getTime() + 1000;
    
    const dateToDisplay = isModified ? modifiedDateString : createdDateString;

    // 포맷팅 함수 선택
    const formatter = useFullDate ? formatFullDate : formatTimeOrDate;

    return {
        dateDisplay: formatter(dateToDisplay),
        isModified: isModified,
    };
};