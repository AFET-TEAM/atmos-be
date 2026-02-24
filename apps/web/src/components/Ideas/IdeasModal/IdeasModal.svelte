<script lang="ts">
  import type { Idea } from "../types/IdeasTypes";
  import "./IdeasModal.scss";

  export let isModalOpen: boolean;
  export let isEditMode: boolean;
  export let selectedIdea: Idea | null;

  export let readOnly: boolean = false;
  export let ownerName: string;
  export let ideaTitle: string;
  export let date: string;
  export let description: string;
  export let presentationFileName: string | undefined;
  export let frontendCount: number | undefined;
  export let backendCount: number | undefined;

  export let onChangeFile: (e: Event) => void;
  export let onSubmitIdea: () => void;
  export let onApproveIdea: (id: number) => void;
  export let onRejectIdea: (id: number) => void;
  export let onDeleteIdea: (id: number) => void;

  export let isAdmin: boolean = false;
  export let canUpdate: boolean = false;
  export let canModerate: boolean = false;
  export let canDelete: boolean = false;

  $: isPendingIdea = !!selectedIdea && selectedIdea.status === "pending";

  $: isAdminPending = canModerate && isPendingIdea;

  $: isUserEdit = canUpdate;

  function downloadIdeaFile() {
  if (!selectedIdea) return;

  const name =
    selectedIdea.fileName ||
    selectedIdea.presentationFileName ||
    "file";

  if (selectedIdea.fileData?.data?.length) {
    const bytes = new Uint8Array(selectedIdea.fileData.data);
    const blob = new Blob([bytes]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }

  if (selectedIdea.fileUrl) {
    const a = document.createElement("a");
    a.href = selectedIdea.fileUrl;
    a.download = name;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

</script>

{#if isModalOpen}
  <div class="modal-overlay">
    <div class="modal-content">
      <button
        type="button"
        class="modal-close"
        aria-label="Close"
        on:click={() => (isModalOpen = false)}
      >
        ×
      </button>
      <div class="modal-owner">
        <span class="input-title">Idea Owner</span>
        <input class="input" type="text" bind:value={ownerName} disabled />
      </div>

      <div class="modal-title">
        <span class="input-title">Title</span>
        <input class="input" type="text" bind:value={ideaTitle} disabled={readOnly} />
      </div>

      <div class="input-group">
        <div class="input-wrapper">
          <div class="input-title">Deadline</div>
          <input class="deadline" type="date" bind:value={date} disabled={readOnly} />
        </div>
        <div class="input-wrapper">
          <div class="input-title">Presentation File</div>
          <input
            type="file"
            id="fileInput"
            on:change={onChangeFile}
            style="display:none;"
            disabled={readOnly}
          />
          {#if selectedIdea && (selectedIdea.fileName || selectedIdea.fileData || selectedIdea.fileUrl)}
            <button
              type="button"
              class="file-label"
              on:click={downloadIdeaFile}
              disabled={false}
            >
              {selectedIdea.fileName || selectedIdea.presentationFileName || "Download file"}
            </button>
          {:else}
            <label
              class="file-label {readOnly ? 'is-disabled' : ''}"
              for="fileInput"
              aria-disabled={readOnly}
            >
              {presentationFileName || "Select File"}
            </label>
          {/if}
        </div>
      </div>

      <div class="input-group">
        <div class="input-wrapper">
          <div class="input-title">Frontend Developers</div>
          <input
            class="input"
            type="number"
            min="0"
            bind:value={frontendCount}
            disabled={readOnly}
          />
        </div>
        <div class="input-wrapper">
          <div class="input-title">Backend Developers</div>
          <input
            class="input"
            type="number"
            min="0"
            bind:value={backendCount}
            disabled={readOnly}
          />
        </div>
      </div>

      <div class="modal-description">
        <div class="input-title">Description</div>
        <textarea class="input" bind:value={description} disabled={readOnly}></textarea>
      </div>

      <div class="modal-actions">
        {#if !isEditMode && !readOnly}
          <button class="send-button" on:click={onSubmitIdea}>Send</button>
        {/if}
        {#if isEditMode && selectedIdea}
          {#if isAdminPending}
            <button
              class="send-button"
              on:click={() => onApproveIdea(selectedIdea.id)}>
              Approve
            </button>
            <button
              class="close-button"
              on:click={() => onRejectIdea(selectedIdea.id)}>
              Reject
            </button>
          {/if}

          {#if isUserEdit}
            <button class="send-button" on:click={onSubmitIdea}>
              Update
            </button>
          {/if}
          {#if canDelete}
            <button
              class="delete-button"
              on:click={() => {onDeleteIdea(selectedIdea.id)}}>
              Delete
            </button>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}
