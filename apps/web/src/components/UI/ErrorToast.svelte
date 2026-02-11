<script lang="ts">
  import { errorHandler, type AppError } from "@/utils/errorHandler";
  import { onDestroy, onMount } from "svelte";

  interface Toast {
    id: number;
    error: AppError;
    visible: boolean;
  }

  let toasts: Toast[] = [];
  let nextId = 0;
  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    unsubscribe = errorHandler.subscribe((error) => {
      addToast(error);
    });
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  function addToast(error: AppError) {
    const id = nextId++;
    const toast: Toast = { id, error, visible: true };
    toasts = [...toasts, toast];

    // 5 saniye sonra kaldır
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }

  function removeToast(id: number) {
    toasts = toasts.map((t) => (t.id === id ? { ...t, visible: false } : t));

    // Animasyon bittikten sonra DOM'dan kaldır
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
    }, 300);
  }

  function getSeverityIcon(severity: string): string {
    switch (severity) {
      case "info":
        return "ℹ️";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "critical":
        return "🚨";
      default:
        return "❌";
    }
  }

  function getSeverityClass(severity: string): string {
    switch (severity) {
      case "info":
        return "toast-info";
      case "warning":
        return "toast-warning";
      case "error":
        return "toast-error";
      case "critical":
        return "toast-critical";
      default:
        return "toast-error";
    }
  }
</script>

<div class="toast-container">
  {#each toasts as toast (toast.id)}
    <div
      class="toast {getSeverityClass(toast.error.severity)}"
      class:toast-hide={!toast.visible}
      role="alert"
    >
      <span class="toast-icon">{getSeverityIcon(toast.error.severity)}</span>
      <div class="toast-content">
        <p class="toast-message">{toast.error.userMessage}</p>
      </div>
      <button
        class="toast-close"
        on:click={() => removeToast(toast.id)}
        aria-label="Kapat"
      >
        ✕
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 400px;
  }

  .toast {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
    transition:
      opacity 0.3s,
      transform 0.3s;
  }

  .toast-hide {
    opacity: 0;
    transform: translateX(100%);
  }

  .toast-error {
    background: #fef2f2;
    border-left: 4px solid #ef4444;
    color: #991b1b;
  }

  .toast-warning {
    background: #fffbeb;
    border-left: 4px solid #f59e0b;
    color: #92400e;
  }

  .toast-info {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    color: #1e40af;
  }

  .toast-critical {
    background: #fef2f2;
    border-left: 4px solid #dc2626;
    color: #7f1d1d;
  }

  .toast-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .toast-content {
    flex: 1;
  }

  .toast-message {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .toast-close {
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.5;
    font-size: 1rem;
    padding: 0;
    line-height: 1;
    transition: opacity 0.2s;
  }

  .toast-close:hover {
    opacity: 1;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (max-width: 480px) {
    .toast-container {
      left: 1rem;
      right: 1rem;
      max-width: none;
    }
  }
</style>
