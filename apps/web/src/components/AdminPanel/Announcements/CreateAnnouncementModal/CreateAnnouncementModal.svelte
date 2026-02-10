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

  $: modalTitle = selectedAnnouncement ? "Update Announcement" : "Add New Announcement";
  $: submitLabel = selectedAnnouncement ? "Update" : "Save";

  $: fields = [
    {
      key: "title",
      label: "Title",
      required: true,
      value: selectedAnnouncement?.title ?? "",
      autoFocus: true,
    },
    {
      key: "content",
      label: "Content",
      required: true,
      value: selectedAnnouncement?.content ?? "",
      type: "textarea",
      placeholder: "Announcement content...",
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
  cancelLabel="Cancel"
  on:close={() => dispatch("close")}
  on:submit={handleInnerSubmit}
/>
