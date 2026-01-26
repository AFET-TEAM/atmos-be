<script lang="ts">
  import { createDocument } from "@/api/DocumentsApi";
  import { getUser, userAtom } from "@/stores/userStore";
  import type { Field } from "@/types/DocumentTypes/DocumentTypes";
  import { createEventDispatcher, onMount } from "svelte";
  import CustomLink from "../UI/CustomLink.svelte";
  import FormModal from "../UI/FormModal.svelte";
  import IconButton from "../UI/IconButton.svelte";
  import "./styles/Documents.scss";

  const dispatch = createEventDispatcher<{
    close: void;
    documentCreated: void;
  }>();

  let titleText = "Doküman Yükle";
  let open = false;
  let saving = false;

  onMount(() => {
    const user = getUser();

    if (!$userAtom && user) {
      userAtom.set(user);
    }
  });

  function handleClick() {
    open = true;
  }

  $: currentUser = $userAtom;

  async function handleInnerSubmit(e: any) {
    const values = e.detail;

    const user = $userAtom;
    if (!user?.id) {
      console.error("User not logged in");
      return;
    }

    try {
      saving = true;

      let fileBase64: string | undefined = undefined;
      let fileName: string | undefined = undefined;

      if (values.uploadFile instanceof File) {
        const file = values.uploadFile as File;
        fileName = file.name;

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;

            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        fileBase64 = base64;
      }

      const payload = {
        title: values.title || "",
        description: values.description || undefined,
        file_url: values.fileUrl || undefined,
        file_data: fileBase64,
        file_name: fileName,
        date: values.date || new Date().toISOString(),
      };

      const createdDocument = await createDocument(payload);

      titleText = `Doküman: ${createdDocument.title}`;

      setTimeout(() => {
        open = false;
        saving = false;
        titleText = "Doküman Yükle";
        dispatch("documentCreated");
      }, 1000);
    } catch (error) {
      alert("Doküman yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
      saving = false;
    }
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
      key: "description",
      label: "Açıklama",
      required: false,
      type: "textarea",
      placeholder: "Kısa açıklama...",
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
      required: false,
      type: "file",
    },
    {
      key: "date",
      label: "Tarih",
      required: false,
      type: "text",
      placeholder: "YYYY-MM-DD",
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
