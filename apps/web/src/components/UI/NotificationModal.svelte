<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import "./NotificationModal.scss";

  type NotificationItem = {
    id: string;
    title: string;
    date: string;
    content: string;
    authorName?: string;
    authorRole?: string;
  };

  const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

  let isOpen = false;
  let data: NotificationItem | null = null;

  const lockScroll = () => {
    if (!isBrowser) return;
    document.body.style.overflow = "hidden";
  };

  const unlockScroll = () => {
    if (!isBrowser) return;
    document.body.style.overflow = "";
  };

  const open = (detail: NotificationItem) => {
    data = detail;
    isOpen = true;
    lockScroll();
  };

  const close = () => {
    isOpen = false;
    unlockScroll();
  };

  const onOpen = (e: Event) => {
    const ce = e as CustomEvent<NotificationItem>;
    open(ce.detail);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };

  onMount(() => {
    if (!isBrowser) return;
    window.addEventListener("notification:open", onOpen as EventListener);
    document.addEventListener("keydown", onKeyDown);
  });

  onDestroy(() => {
    if (!isBrowser) return;
    window.removeEventListener("notification:open", onOpen as EventListener);
    document.removeEventListener("keydown", onKeyDown);
    unlockScroll();
  });
</script>

{#if isOpen}
  <div class="notif-modal" role="dialog" aria-modal="true" aria-label="Notification">
    <div class="notif-modal__backdrop" on:click={close}></div>

    <div class="notif-modal__panel">
      <div class="notif-modal__header">
        <div class="notif-modal__title">{data?.title ?? ""}</div>

        <div class="notif-modal__head-right">
          <div class="notif-modal__date">{data?.date ?? ""}</div>
          <button class="notif-modal__close" type="button" aria-label="Close" on:click={close}>
            ✕
          </button>
        </div>
      </div>

      <div class="notif-modal__body">{data?.content ?? ""}</div>

      <div class="notif-modal__footer">
        <div class="footer">
          <p class="name">{data?.authorName ?? ""}</p>
          <p class="role">{data?.authorRole ?? ""}</p>
        </div>
      </div>
    </div>
  </div>
{/if}
