<script lang="ts">
  import DynamicCard from "@/components/UI/DynamicCard.svelte";
  import { userAtom } from "@/stores/userStore";
  import { onMount } from "svelte";
  import {
    createTechTalk,
    deleteTechTalk,
    fetchTechTalks,
    updateTechTalk,
  } from "../../../api/TechTalksApi";
  import ConfirmModal from "../../UI/ConfirmModal.svelte";
  import CreateTechTalkModal from "../CreateTechtalkModal/CreateTechtalksModal.svelte";
  import type { TechTalk } from "../types/TechTalks";
  import "./TechtalksPage.scss";

  let talks: TechTalk[] = [];
  let showModal = false;
  let saving = false;
  let talkToEdit: TechTalk | null = null;
  let showConfirm = false;
  let pendingDeleteId: number | null = null;
  let loading = false;

  $: isAdmin = $userAtom?.role === "admin";
  $: currentUserId = $userAtom?.id;

  onMount(async () => {
    await loadTechTalks();
  });

  async function loadTechTalks() {
    try {
      loading = true;
      talks = await fetchTechTalks();
    } catch (error) {
      console.error("TechTalks yüklenirken hata oluştu:", error);
    } finally {
      loading = false;
    }
  }

  function handleUpdate(talk: TechTalk) {
    talkToEdit = talk;
    showModal = true;
  }

  function handleDeleteRequest(id: number) {
    pendingDeleteId = id;
    showConfirm = true;
  }

  async function doConfirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await deleteTechTalk(pendingDeleteId);
      talks = talks.filter((t) => t.id !== pendingDeleteId);
      pendingDeleteId = null;
      showConfirm = false;
    } catch (error) {
      console.error("TechTalk silinirken hata oluştu:", error);
    }
  }

  function cancelConfirm() {
    showConfirm = false;
    pendingDeleteId = null;
  }

  type SubmitPayload = {
    title: string;
    description: string;
    thumbnailUrl: string;
    teamsRoomUrl: string;
    videoUrl: string;
    location: string;
  };

  type SubmitDetail = { id?: number; payload: SubmitPayload };

  async function handleSubmit(e: CustomEvent<SubmitDetail>) {
    const { id, payload } = e.detail;
    saving = true;

    try {
      const base = {
        user_id: $userAtom?.id || 0,
        title: payload.title,
        description: payload.description,
        location: payload.location,
        video_url: payload.videoUrl,
        thumbnail_url: payload.thumbnailUrl,
        teams_room_url: payload.teamsRoomUrl,
        date: new Date().toISOString(),
      };

      if (id) {
        // Güncelleme
        const updated = await updateTechTalk(id, base);
        talks = talks.map((t) => (t.id === id ? updated : t));
      } else {
        // Yeni oluşturma
        const newTalk = await createTechTalk(base);
        talks = [...talks, newTalk];
      }

      showModal = false;
      talkToEdit = null;
    } catch (error) {
      console.error("TechTalk kaydedilirken hata oluştu:", error);
      alert("TechTalk kaydedilemedi");
    } finally {
      saving = false;
    }
  }

  function openCreate() {
    talkToEdit = null;
    showModal = true;
  }

  function getActions(talk: TechTalk) {
    const isOwner =
      currentUserId === talk.userId || currentUserId === talk.user_id;

    return [
      {
        label: "Görüntüle",
        onClick: () => (window.location.href = `/techtalks/${talk.id}`),
        variant: "blue" as const,
        icon: "download" as const,
      },
      {
        label: "Güncelle",
        onClick: () => handleUpdate(talk),
        variant: "green" as const,
        icon: "update" as const,
        adminOnly: !isOwner,
      },
      {
        label: "Sil",
        onClick: () => handleDeleteRequest(talk.id),
        variant: "red" as const,
        icon: "delete" as const,
        adminOnly: !isOwner,
      },
    ];
  }
</script>

<section>
  <div class="header-row">
    <button class="btn btn-blue" on:click={openCreate}> + New TechTalk </button>
  </div>

  {#if loading}
    <div class="loading-container">
      <p>Yükleniyor...</p>
    </div>
  {:else if talks.length === 0}
    <div class="empty-state">
      <p>Henüz TechTalk kaydı bulunmuyor.</p>
    </div>
  {:else}
    <div class="tt-list">
      {#each talks as talk (talk.id)}
        <DynamicCard
          imgSrc={talk.thumbnailUrl || talk.thumbnail_url || ""}
          title={talk.title}
          titleHref={`/techtalks/${talk.id}`}
          description={talk.description || ""}
          owner={talk.userId?.toString() || talk.user_id?.toString() || ""}
          {isAdmin}
          actions={getActions(talk)}
        />
      {/each}
    </div>
  {/if}

  <CreateTechTalkModal
    open={showModal}
    {saving}
    {talkToEdit}
    on:close={() => {
      showModal = false;
      talkToEdit = null;
    }}
    on:submit={handleSubmit}
  />

  <ConfirmModal
    open={showConfirm}
    title="Bu TechTalk kaydını silmek istiyor musunuz?"
    message="Bu işlem geri döndürülemez"
    confirmText="Sil"
    cancelText="Vazgeç"
    on:confirm={doConfirmDelete}
    on:cancel={cancelConfirm}
    on:close={cancelConfirm}
  ></ConfirmModal>
</section>
