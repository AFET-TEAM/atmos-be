export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
  timestamp: Date;
}

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
  FORBIDDEN: "Bu işlem için yetkiniz bulunmuyor.",
  INVALID_CREDENTIALS: "E-posta veya şifre hatalı.",
  SESSION_EXPIRED: "Oturumunuz zaman aşımına uğradı.",
  NETWORK_ERROR: "İnternet bağlantınızı kontrol edin.",
  TIMEOUT: "Sunucu yanıt vermedi. Lütfen tekrar deneyin.",
  SERVER_ERROR: "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
  NOT_FOUND: "Aradığınız içerik bulunamadı.",
  VALIDATION_ERROR: "Girdiğiniz bilgileri kontrol edin.",
  DUPLICATE_ENTRY: "Bu kayıt zaten mevcut.",
  UNKNOWN_ERROR: "Beklenmeyen bir hata oluştu.",
};

const HTTP_STATUS_MAP: Record<number, { code: string; message: string }> = {
  400: {
    code: "VALIDATION_ERROR",
    message: "Girdiğiniz bilgileri kontrol edin.",
  },
  401: {
    code: "UNAUTHORIZED",
    message: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
  },
  403: { code: "FORBIDDEN", message: "Bu işlem için yetkiniz bulunmuyor." },
  404: { code: "NOT_FOUND", message: "Aradığınız içerik bulunamadı." },
  408: { code: "TIMEOUT", message: "İstek zaman aşımına uğradı." },
  409: { code: "DUPLICATE_ENTRY", message: "Bu kayıt zaten mevcut." },
  422: {
    code: "VALIDATION_ERROR",
    message: "Girdiğiniz bilgileri kontrol edin.",
  },
  429: {
    code: "RATE_LIMIT",
    message: "Çok fazla istek gönderdiniz. Lütfen bekleyin.",
  },
  500: { code: "SERVER_ERROR", message: "Sunucu hatası oluştu." },
  502: {
    code: "SERVER_ERROR",
    message: "Sunucu geçici olarak kullanılamıyor.",
  },
  503: {
    code: "SERVER_ERROR",
    message: "Sunucu bakımda. Lütfen daha sonra tekrar deneyin.",
  },
  504: { code: "TIMEOUT", message: "Sunucu yanıt vermedi." },
};

interface AxiosError {
  response?: { status: number; data?: { error?: string; message?: string } };
  code?: string;
  message: string;
}

class ErrorHandler {
  private listeners: ((error: AppError) => void)[] = [];
  private isDev =
    typeof process !== "undefined" && process.env.NODE_ENV === "development";

  subscribe(listener: (error: AppError) => void): () => void {
    this.listeners.push(listener);
    return () =>
      (this.listeners = this.listeners.filter((l) => l !== listener));
  }

  private notify(error: AppError): void {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch {}
    });
  }

  handleApiError(error: unknown, context?: string): AppError {
    const appError = this.parseError(error, context);

    if (this.isDev) {
      console.group(`🔴 ${appError.code}`);
      console.error("Context:", context);
      console.error("Error:", error);
      console.groupEnd();
    }

    this.notify(appError);
    return appError;
  }

  private parseError(error: unknown, context?: string): AppError {
    const timestamp = new Date();

    if (this.isAxiosError(error)) {
      return this.parseAxiosError(error, context, timestamp);
    }

    if (error instanceof Error) {
      return {
        code: "UNKNOWN_ERROR",
        message: error.message,
        userMessage: ERROR_MESSAGES.UNKNOWN_ERROR,
        severity: "error",
        details: { context, stack: error.stack },
        timestamp,
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: String(error),
      userMessage: ERROR_MESSAGES.UNKNOWN_ERROR,
      severity: "error",
      details: { context, raw: error },
      timestamp,
    };
  }

  private parseAxiosError(
    error: AxiosError,
    context?: string,
    timestamp: Date,
  ): AppError {
    const status = error.response?.status;
    const serverMessage =
      error.response?.data?.error || error.response?.data?.message;

    if (status && HTTP_STATUS_MAP[status]) {
      const { code, message } = HTTP_STATUS_MAP[status];
      return {
        code,
        message: serverMessage || message,
        userMessage: serverMessage || message,
        severity: status >= 500 ? "error" : "warning",
        details: { status, context, serverMessage },
        timestamp,
      };
    }

    if (error.code === "ERR_NETWORK" || !error.response) {
      return {
        code: "NETWORK_ERROR",
        message: "Network error",
        userMessage: ERROR_MESSAGES.NETWORK_ERROR,
        severity: "error",
        details: { context },
        timestamp,
      };
    }

    if (error.code === "ECONNABORTED") {
      return {
        code: "TIMEOUT",
        message: "Request timeout",
        userMessage: ERROR_MESSAGES.TIMEOUT,
        severity: "warning",
        details: { context },
        timestamp,
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      userMessage: ERROR_MESSAGES.UNKNOWN_ERROR,
      severity: "error",
      details: { context },
      timestamp,
    };
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (
      typeof error === "object" && error !== null && "isAxiosError" in error
    );
  }
}

export const errorHandler = new ErrorHandler();

export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  context?: string,
): Promise<{ data: T; error: null } | { data: null; error: AppError }> {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    const appError = errorHandler.handleApiError(error, context);
    return { data: null, error: appError };
  }
}

export async function apiCall<T>(
  apiCall: () => Promise<T>,
  context?: string,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    const appError = errorHandler.handleApiError(error, context);
    throw appError;
  }
}
