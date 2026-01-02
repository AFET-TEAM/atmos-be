<script lang="ts">
  import FormModal from "../../../UI/FormModal.svelte";

  export let open = false;
  export let saving = false;
  export let selectedAnnouncement: any | null = null;

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{
    close: void;
    submit: {
      id?: number;
      payload: {
        title: string;
        content: string;
      };
    };
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

  $: modalTitle = selectedAnnouncement
    ? "TechTalk Güncelle"
    : "Yeni Duyuru Ekle";
  $: submitLabel = selectedAnnouncement ? "Güncelle" : "Kaydet";

  $: fields = [
    {
      key: "title",
      label: "Başlık",
      required: true,
      value: selectedAnnouncement?.title ?? "",
      autoFocus: true,
    },
    {
      key: "content",
      label: "İçerik",
      required: true,
      value: selectedAnnouncement?.content ?? "",
      type: "textarea",
      placeholder: "Duyuru içeriği...",
    },
  ] satisfies Field[];

  function handleInnerSubmit(e: CustomEvent<SubmitValues>) {
    const v = e.detail;
    const payload = {
      title: String(v.title ?? ""),
      content: String(v.content ?? ""),
    };
    dispatch("submit", { id: selectedAnnouncement?.id, payload });
  }
</script>

<FormModal
  {open}
  {saving}
  title={modalTitle}
  {fields}
  {submitLabel}
  cancelLabel="İptal"
  on:close={() => dispatch("close")}
  on:submit={handleInnerSubmit}
/>
