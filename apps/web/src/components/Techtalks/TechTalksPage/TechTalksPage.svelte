<script lang="ts">
  import { isLoggedIn, user } from "@/utils/user";
  import { onMount } from "svelte";
  import {
    createTechTalk,
    deleteTechTalk,
    fetchTechTalks,
    updateTechTalk,
  } from "../../../api/TechTalksApi";
  import ConfirmModal from "../../UI/ConfirmModal.svelte";
  import CreateTechTalkModal from "../CreateTechtalkModal/CreateTechtalksModal.svelte";
  import TechTalksCards from "../TechTalksCards/TechTalksCards.svelte";
  import type { TechTalk } from "../types/TechTalks";
  import "./TechtalksPage.scss";

  let talks: TechTalk[] = [];
  $: currentUserData = user.get();
  $: isAdmin =
    currentUserData?.role === "admin" || currentUserData?.role === "editor";

  let showModal = false;
  let saving = false;
  let talkToEdit: TechTalk | null = null;

  let showConfirm = false;
  let pendingDeleteId: number | null = null;

  async function load() {
    try {
      talks = await fetchTechTalks();
      console.log("Fetched TechTalks in load():", talks);
      console.log("TechTalks loaded:", talks);
    } catch (error) {
      console.error("Error loading techtalks:", error);
    }
  }
  onMount(load);

  function handleDownload(talk: TechTalk) {
    const videoUrl = talk.video_url || talk.videoUrl;
    if (!videoUrl) {
      console.warn("No video URL available for download");
      return;
    }

    const a = document.createElement("a");
    a.href = videoUrl;
    a.setAttribute("download", `${talk.title}.mp4`);
    document.body.appendChild(a);
    a.click();
    a.remove();
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
    await deleteTechTalk(pendingDeleteId);
    talks = talks.filter((t) => t.id !== pendingDeleteId);
    pendingDeleteId = null;
    showConfirm = false;
  }

  function cancelConfirm() {
    showConfirm = false;
    pendingDeleteId = null;
  }

  type SubmitDetail = { id?: number; payload: Partial<TechTalk> };
  async function handleSubmit(e: CustomEvent<SubmitDetail>) {
    const { id, payload } = e.detail;
    saving = true;
    try {
      if (!payload.user_id && currentUserData) {
        payload.user_id = currentUserData.id;
      }

      if (id) {
        await updateTechTalk(id, payload);
      } else {
        await createTechTalk(payload as Omit<TechTalk, "id">);
      }
      await load();
      showModal = false;
      talkToEdit = null;
    } catch (error) {
      console.error("Error saving techtalk:", error);
    } finally {
      saving = false;
    }
  }

  function openCreate() {
    talkToEdit = null;
    showModal = true;
  }
</script>

<section>
  <div class="header-row">
    {#if isLoggedIn() && (isAdmin || currentUserData?.role === "user")}
      <button class="btn btn-blue" on:click={openCreate}>
        + New TechTalk
      </button>
    {/if}
  </div>

  {#if talks.length === 0}
    <div class="empty-state">
      <p>Henüz hiç TechTalk eklenmemiş.</p>
      {#if isLoggedIn()}
        <button class="btn btn-blue" on:click={openCreate}>
          İlk TechTalk'ı Ekle
        </button>
      {/if}
    </div>
  {:else}
    <div class="tt-list">
      {#each talks as talk (talk.id)}
        <TechTalksCards
          {talk}
          {isAdmin}
          onDownload={handleDownload}
          onUpdate={handleUpdate}
          onDelete={handleDeleteRequest}
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
