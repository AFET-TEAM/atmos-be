<script lang="ts">
  import FormModal from "../../../UI/FormModal.svelte";

  export let open = false;
  export let saving = false;
  export let selectedAnnouncement: any | null = null;

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{
    close: void;
    submit: { id?: number; payload: {
      title: string;
      description: string;
      owner: string;
      thumbnailUrl: string;
      videoUrl: string;
      location: string
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

  $: modalTitle = selectedAnnouncement ? "TechTalk Güncelle" : "Yeni Duyuru Ekle";
  $: submitLabel = selectedAnnouncement ? "Güncelle" : "Kaydet";

  $: fields = [
    { key: "title", label: "Başlık", required: true,  value: selectedAnnouncement?.title ?? "", autoFocus: true },
    { key: "description", label: "Açıklama", required: true,  value: selectedAnnouncement?.description ?? "", type: "textarea", placeholder: "Kısa açıklama..." },
    { key: "location", label: "Lokasyon", required: true, value: selectedAnnouncement?.location ?? "", placeholder: "Örn: Online"},
    { key: "thumbnailUrl", label: "Thumbnail URL", required: false,  value: selectedAnnouncement?.thumbnailUrl ?? "", type: "url", placeholder: "https://..." },
    { key: "videoUrl", label: "Video URL", required: true,  value: selectedAnnouncement?.videoUrl ?? "", type: "url", placeholder: "https://youtu.be/..." }
  ] satisfies Field[];

  function handleInnerSubmit(e: CustomEvent<SubmitValues>) {
    const v = e.detail;
    const payload = {
      title: String(v.title ?? ""),
      description: String(v.description ?? ""),
      owner: String(v.owner ?? ""),
      location: String(v.location ?? ""),
      thumbnailUrl: String(v.thumbnailUrl ?? ""),
      videoUrl: String(v.videoUrl ?? "")
    };
    dispatch("submit", { id: selectedAnnouncement?.id, payload });
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
