<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import CustomLink from "../UI/CustomLink.svelte";
  import FormModal from "../UI/FormModal.svelte";
  import IconButton from "../UI/IconButton.svelte";
  import "./styles/Documents.scss";
  import type { Field } from "@/types/DocumentTypes/DocumentTypes";
  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  let titleText = "Doküman Yükle";
  let open = false;
  let saving = false;

  function handleClick() {
    console.log("Button clicked!");
    open = true;
  }

  function handleInnerSubmit(e: any) {
    const v = e.detail;
    console.log("Submitted values:", v);
    titleText = v.title ? `Doküman: ${v.title}` : "Doküman Yükle";
  }

  function handleClose() {
    open = false;
    dispatch("close");
  }

  $: fields = [
    {
      key: "title",
      label: "Başlık",
      required: true,
      autoFocus: true,
    },
    {
      key: "name",
      label: "Açıklama",
      required: true,
      type: "textarea",
      placeholder: "Kısa açıklama...",
    },
    {
      key: "owner",
      label: "Doküman Sahibi",
      required: true,
    },
    {
      key: "fileUrl",
      label: "Dosya URL'si",
      required: false,
      type: "url",
      placeholder: "https://...",
    },
    {
      key: "uploadFile",
      label: "Dosya Yükle",
      required: true,
      type: "file",
    },
  ] satisfies Field[];
</script>

<div class="documents-header">
  <div class="header-buttons">
    <CustomLink
      text="Doküman Oluştur"
      href="/createdocument"
      iconName="download"
      size={12}
      border={true}
    />

    <IconButton
      text="Doküman Yükle"
      iconName="download"
      buttonType="secondary"
      className="customLink"
      color="blue"
      border={true}
      on:click={handleClick}
    />
  </div>

  <FormModal
    {open}
    {saving}
    cancelLabel="İptal"
    title={titleText}
    {fields}
    on:close={handleClose}
    on:submit={handleInnerSubmit}
  />
</div>
