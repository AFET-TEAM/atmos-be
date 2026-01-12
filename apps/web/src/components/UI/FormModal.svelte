<script lang="ts">
  import type { Field } from "@/types/DocumentTypes/DocumentTypes";
  import { createEventDispatcher, onMount } from "svelte";
  import "./FormModal.scss";

  export let open = false;
  export let saving = false;
  export let title = "Form";
  export let fields: Field[] = [];
  export let submitLabel = "Kaydet";
  export let cancelLabel = "İptal";

  const dispatch = createEventDispatcher<{
    close: void;
    submit: Record<string, string | number | File | null>;
  }>();

  let localValues: Record<string, string | number | File | null> = {};
  let fileInputs: Record<string, File | null> = {};
  let errors: Record<string, string> = {};
  let showErrors = false;
  let modalEl: HTMLDivElement | null = null;

  function isValidUrl(u: string) {
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  }

  $: if (open) {
    const nextVals: Record<string, string | number | File | null> = {};
    const nextErrs: Record<string, string> = {};
    for (const f of fields) {
      nextVals[f.key] = f.type === "file" ? null : (f.value ?? "");
      nextErrs[f.key] = "";
    }
    localValues = nextVals;
    errors = nextErrs;
    showErrors = false;
    fileInputs = {};
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const f of fields) {
      if (f.type === "file") {
        const file = fileInputs[f.key];
        if (f.required && !file) {
          next[f.key] = "Bu alan zorunludur.";
        } else {
          next[f.key] = "";
        }
        continue;
      }

      const raw = localValues[f.key];
      const val = (raw ?? "").toString().trim();

      if (f.required && !val) {
        next[f.key] = "Bu alan zorunludur.";
        continue;
      }

      if (val && f.type === "url" && !isValidUrl(val)) {
        next[f.key] = "Geçerli bir URL girin.";
        continue;
      }

      next[f.key] = "";
    }
    errors = next;
    return Object.values(next).every((e) => !e);
  }

  function close() {
    if (!saving) dispatch("close");
  }

  function submit() {
    const ok = validate();
    showErrors = true;
    if (!ok) return;
    const submitData = { ...localValues };
    // Add file inputs to submit data
    for (const key in fileInputs) {
      submitData[key] = fileInputs[key];
    }
    dispatch("submit", submitData);
  }

  function handleFileChange(key: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    fileInputs[key] = file;
    localValues[key] = file;
  }

  function onWindowKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape") close();
  }

  onMount(() => {
    const obs = new MutationObserver(() => {
      if (!open || !modalEl) return;
      const idx = fields.findIndex((f) => f.autoFocus);
      const selector =
        idx >= 0
          ? `[data-key="${fields[idx].key}"]`
          : `[data-key="${fields[0]?.key}"]`;
      const el = modalEl.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        selector,
      );
      el?.focus();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  });
</script>

<svelte:window on:keydown={onWindowKeydown} />

{#if open}
  <button
    type="button"
    class="modal-backdrop"
    aria-label="Close modal"
    on:click={close}
  ></button>

  <div
    bind:this={modalEl}
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="form-modal-title"
  >
    <h2 id="form-modal-title">{title}</h2>

    {#each fields as f}
      <label class="field">
        <span>{f.label}</span>

        {#if f.type === "textarea"}
          <textarea
            rows="4"
            data-key={f.key}
            placeholder={f.placeholder}
            bind:value={localValues[f.key]}
          ></textarea>
        {:else if f.type === "file"}
          <input
            data-key={f.key}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            on:change={(e) => handleFileChange(f.key, e)}
          />
          {#if fileInputs[f.key]}
            <small class="file-info"
              >Seçilen dosya: {fileInputs[f.key]?.name}</small
            >
          {/if}
        {:else}
          <input
            data-key={f.key}
            type={f.type ?? "text"}
            placeholder={f.placeholder}
            bind:value={localValues[f.key]}
          />
        {/if}

        {#if showErrors && errors[f.key]}
          <p class="error-text">{errors[f.key]}</p>
        {/if}
      </label>
    {/each}

    <div class="actions">
      <button
        type="button"
        class="btn btn-ghost"
        on:click={close}
        disabled={saving}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        class="btn btn-primary"
        on:click={submit}
        disabled={saving}
      >
        {saving ? "Kaydediliyor..." : submitLabel}
      </button>
    </div>
  </div>
{/if}
