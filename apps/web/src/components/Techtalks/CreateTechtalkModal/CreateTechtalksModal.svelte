<script lang="ts">
  import FormModal from "../../UI/FormModal.svelte";
  import type { TechTalk } from "../types/TechTalks";

  export let open = false;
  export let saving = false;
  export let talkToEdit: TechTalk | null = null;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher<{
    close: void;
    submit: { id?: number; payload: {
      title: string;
      name: string;
      owner: string;
      thumbnailUrl: string;
      videoUrl: string;
    }};
  }>();

  type Field = {
    key: string;
    label: string;
    type?: "text" | "url" | "textarea" | "number" | "email" | "password";
    placeholder?: string;
    required?: boolean;
    value?: string | number;
    autoFocus?: boolean;
  };

  type SubmitValues = Record<string, string | number>;

  $: modalTitle = talkToEdit ? "TechTalk Güncelle" : "Yeni TechTalk Ekle";
  $: submitLabel = talkToEdit ? "Güncelle" : "Kaydet";

  $: fields = [
    { key: "title",        label: "Başlık",        required: true,  value: talkToEdit?.title ?? "", autoFocus: true },
    { key: "name",         label: "Açıklama",      required: true,  value: talkToEdit?.name ?? "", type: "textarea", placeholder: "Kısa açıklama..." },
    { key: "owner",        label: "Konuşmacı",     required: true,  value: talkToEdit?.owner ?? "" },
    { key: "thumbnailUrl", label: "Thumbnail URL", required: false,  value: talkToEdit?.thumbnailUrl ?? "", type: "url", placeholder: "https://..." },
    { key: "videoUrl",     label: "Video URL",     required: true,  value: talkToEdit?.videoUrl ?? "",     type: "url", placeholder: "https://youtu.be/..." }
  ] satisfies Field[];

  function handleInnerSubmit(e: CustomEvent<SubmitValues>) {
    const v = e.detail;
    const payload = {
      title: String(v.title ?? ""),
      name: String(v.name ?? ""),
      owner: String(v.owner ?? ""),
      thumbnailUrl: String(v.thumbnailUrl ?? ""),
      videoUrl: String(v.videoUrl ?? "")
    };
    dispatch("submit", { id: talkToEdit?.id, payload });
  }
</script>

<FormModal
  {open}
  {saving}
  title={modalTitle}
  {fields}
  submitLabel={submitLabel}
  cancelLabel="İptal"
  on:close={() => dispatch("close")}
  on:submit={handleInnerSubmit}
/>
