<script lang="ts">
  import {
    deleteDocument,
    downloadDocument,
    getAllDocuments,
    updateDocument,
    type DocumentItem,
  } from "@/api/DocumentsApi";
  import { userAtom } from "@/stores/userStore";
  import type { Field } from "@/types/DocumentTypes/DocumentTypes";
  import { onMount } from "svelte";
  import DynamicCard from "../UI/DynamicCard.svelte";
  import FormModal from "../UI/FormModal.svelte";

  let documents: DocumentItem[] = [];
  let loading = true;
  let editingDocument: DocumentItem | null = null;
  let openEditModal = false;
  let saving = false;

  onMount(async () => {
    await loadDocuments();
  });

  async function loadDocuments() {
    try {
      loading = true;
      documents = await getAllDocuments();
    } catch (error) {
      console.error("Error loading documents:", error);
      alert("Dokümanlar yüklenirken hata oluştu");
    } finally {
      loading = false;
    }
  }

  async function handleDownload(document: any) {
    try {
      const blob = await downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = document.fileName || `${document.title}`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Dosya indirilemedi");
    }
  }

  function handleUpdate(document: DocumentItem) {
    editingDocument = document;
    openEditModal = true;
  }

  async function handleEditSubmit(e: any) {
    if (!editingDocument) return;

    const values = e.detail;

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

      const payload: any = {
        title: values.title || editingDocument.title,
        description: values.description || undefined,
        file_url: values.fileUrl || undefined,
      };

      if (fileBase64) {
        payload.file_data = fileBase64;
        payload.file_name = fileName;
      }

      if (values.date) {
        payload.date = values.date;
      }

      await updateDocument(editingDocument.id, payload);

      openEditModal = false;
      editingDocument = null;
      await loadDocuments();

      alert("Doküman başarıyla güncellendi");
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Doküman güncellenirken hata oluştu");
    } finally {
      saving = false;
    }
  }

  async function handleDelete(documentId: number) {
    if (!confirm("Bu dokümanı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await deleteDocument(documentId);
      await loadDocuments();
      alert("Doküman başarıyla silindi");
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Doküman silinirken hata oluştu");
    }
  }

  function handleEditClose() {
    openEditModal = false;
    editingDocument = null;
  }

  $: editFields = editingDocument
    ? ([
        {
          key: "title",
          label: "Başlık",
          required: true,
          autoFocus: true,
          value: editingDocument.title,
        },
        {
          key: "description",
          label: "Açıklama",
          required: false,
          type: "textarea" as const,
          placeholder: "Kısa açıklama...",
          value: editingDocument.description || "",
        },
        {
          key: "fileUrl",
          label: "Dosya URL'si",
          required: false,
          type: "url" as const,
          placeholder: "https://...",
          value: editingDocument.file_url || "",
        },
        {
          key: "uploadFile",
          label: "Yeni Dosya Yükle",
          required: false,
          type: "file" as const,
        },
        {
          key: "date",
          label: "Tarih",
          required: false,
          type: "text" as const,
          placeholder: "YYYY-MM-DD",
          value: editingDocument.date || "",
        },
      ] satisfies Field[])
    : [];

  $: isAdmin = $userAtom?.role === "admin";
  $: currentUserId = $userAtom?.id;

  function getActions(document: DocumentItem) {
    const isOwner = currentUserId === document.userId;

    return [
      {
        label: "İndir",
        onClick: () => handleDownload(document),
        variant: "blue" as const,
        icon: "download" as const,
      },
      {
        label: "Güncelle",
        onClick: () => handleUpdate(document),
        variant: "green" as const,
        icon: "update" as const,
        adminOnly: !isOwner,
      },
      {
        label: "Sil",
        onClick: () => handleDelete(document.id),
        variant: "red" as const,
        icon: "delete" as const,
        adminOnly: !isOwner,
      },
    ];
  }
</script>

{#if loading}
  <div class="loading">Yükleniyor...</div>
{:else}
  <div class="documents-list">
    {#each documents as document (document.id)}
      <DynamicCard
        title={document.title}
        description={document.description || ""}
        owner={document.userId?.toString() || ""}
        titleHref={`/documents/${document.id}`}
        {isAdmin}
        actions={getActions(document)}
      />
    {/each}
  </div>
{/if}

<FormModal
  open={openEditModal}
  {saving}
  cancelLabel="İptal"
  title={editingDocument ? `Düzenle: ${editingDocument.title}` : "Düzenle"}
  fields={editFields}
  on:close={handleEditClose}
  on:submit={handleEditSubmit}
/>
