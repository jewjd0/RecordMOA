import { toast } from 'sonner';

// Firebase 에러 코드를 한글 메시지로 변환
export const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    // Auth 에러
    'auth/user-not-found': '존재하지 않는 사용자입니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다.',
    'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
    'auth/too-many-requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    'auth/popup-closed-by-user': '로그인 창이 닫혔습니다.',

    // Firestore 에러
    'permission-denied': '접근 권한이 없습니다.',
    'not-found': '요청한 데이터를 찾을 수 없습니다.',
    'already-exists': '이미 존재하는 데이터입니다.',
    'resource-exhausted': '할당량이 초과되었습니다.',
    'failed-precondition': '작업을 수행할 수 없는 상태입니다.',
    'aborted': '작업이 중단되었습니다.',
    'out-of-range': '유효한 범위를 벗어났습니다.',
    'unimplemented': '지원되지 않는 기능입니다.',
    'internal': '내부 오류가 발생했습니다.',
    'unavailable': '서비스를 일시적으로 사용할 수 없습니다.',
    'data-loss': '데이터 손실이 발생했습니다.',
    'unauthenticated': '인증이 필요합니다.',

    // 기본 메시지
    'default': '오류가 발생했습니다. 다시 시도해주세요.',
  };

  return errorMessages[errorCode] || errorMessages['default'];
};

// 네트워크 에러 처리
export const handleNetworkError = (error: any): string => {
  if (!navigator.onLine) {
    return '인터넷 연결을 확인해주세요.';
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  }

  if (error.response?.status === 429) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }

  if (error.response?.status >= 500) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  return '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
};

// 통합 에러 핸들러
export const handleError = (error: any, customMessage?: string) => {
  console.error('Error:', error);

  let errorMessage = customMessage || '오류가 발생했습니다.';

  // Firebase 에러
  if (error.code) {
    errorMessage = getFirebaseErrorMessage(error.code);
  }
  // 네트워크 에러
  else if (error.response || error.request) {
    errorMessage = handleNetworkError(error);
  }
  // 일반 에러
  else if (error.message) {
    errorMessage = error.message;
  }

  toast.error(errorMessage);
  return errorMessage;
};

// 성공 메시지
export const showSuccess = (message: string) => {
  toast.success(message);
};

// 정보 메시지
export const showInfo = (message: string) => {
  toast.info(message);
};

// 경고 메시지
export const showWarning = (message: string) => {
  toast.warning(message);
};

// 로딩 토스트 (Promise 기반)
export const showLoadingToast = async <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error?: string;
  }
): Promise<T> => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error || '오류가 발생했습니다.',
  });
};

// 재시도 가능한 에러 핸들러
export const handleRetryableError = (
  error: any,
  retryFn: () => void,
  customMessage?: string
) => {
  const errorMessage = handleError(error, customMessage);

  toast.error(errorMessage, {
    action: {
      label: '재시도',
      onClick: retryFn,
    },
  });
};
