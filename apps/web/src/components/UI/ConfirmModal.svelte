<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import "./ConfirmModal.scss"; 

  export let open = false;
  export let title = "Onayla";
  export let message = "Bu işlemi yapmak istediğine emin misin?";
  export let confirmText = "Evet";
  export let cancelText = "İptal";
  export let disabled = false;

  const dispatch = createEventDispatcher<{
    close: void;
    cancel: void;
    confirm: void;
  }>();

  function cancel() {
    if (!disabled) {
      dispatch("cancel");
      dispatch("close");
    }
  }
  function confirm() {
    if (!disabled) dispatch("confirm");
  }
  function onWindowKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape") cancel();
    if (e.key === "Enter") confirm();
  }

</script>

<svelte:window on:keydown={onWindowKeydown} />
{#if open}
 <button
  class="modal-backdrop"
  type="button"
  aria-label="Close dialog"
  on:click={cancel}
></button>

 <div class="modal confirm-modal-wide" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
    <div class="confirm-modal">
     <div class="confirm-header">
  <div  class="confirm-badge">
    <svg width="72" height="72" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#D9412B" stroke="#9F2A1D" stroke-width="4"/>
      <rect x="29" y="16" width="6" height="24" rx="3" fill="#FFFFFF"/>
      <circle cx="32" cy="46" r="4" fill="#FFFFFF"/>
    </svg>
  </div>

  <h3 id="confirm-title" class="confirm-title">{title}</h3>
</div>

      <p class="confirm-message">{message}</p>

      <div class="actions actions-centered">
        <button type="button" class="btn btn-ghost" on:click={cancel} disabled={disabled}>
          {cancelText}
        </button>
        <button type="button" class="btn confirm-icon"  on:click={confirm} disabled={disabled}>
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
