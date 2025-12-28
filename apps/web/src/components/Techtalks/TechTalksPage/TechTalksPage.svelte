<script lang="ts">
  import { onMount } from "svelte";
  import CreateTechTalkModal from "../CreateTechtalkModal/CreateTechtalksModal.svelte";
  import ConfirmModal from "../../UI/ConfirmModal.svelte"; 
  import { fetchCurrentUser } from "../../../api/IdeasApi"
  import { fetchTechTalks, deleteTechTalk, updateTechTalk, createTechTalk } from "../../../api/TechTalksApi";
  import type { TechTalk, CurrentUser } from "../types/TechTalks";
  import "./TechtalksPage.scss";
  import TechTalksCards from "../TechTalksCards/TechTalksCards.svelte";

  let talks: TechTalk[] = [];
  let user: CurrentUser | null = null;
  let isAdmin = false;

  let showModal = false;
  let saving = false;
  let talkToEdit: TechTalk | null = null;

  let showConfirm = false;
  let pendingDeleteId: number | null = null;

  async function load() {
    const [u, t] = await Promise.all([fetchCurrentUser(), fetchTechTalks()]);
    user = u;
    isAdmin = u.role === "admin";
    talks = t;
  }
  onMount(load);

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
    talks = talks.filter(t => t.id !== pendingDeleteId);
    pendingDeleteId = null;
    showConfirm = false;
  }

  function cancelConfirm() {
    showConfirm = false;
    pendingDeleteId = null;
  }

  type SubmitPayload = {
  title: string;
  description: string;
  owner: string;
  thumbnailUrl: string;
  videoUrl: string;
  location: string;
};

type SubmitDetail = { id?: number; payload: SubmitPayload };

 async function handleSubmit(e: CustomEvent<SubmitDetail>) {
  const { id, payload } = e.detail;
  saving = true;

  try {
    const base = {
      title: payload.title,
      description: payload.description,     
      owner: payload.owner,
      thumbnailUrl: payload.thumbnailUrl,
      videoUrl: payload.videoUrl,
      location: payload.location
    };

    if (id) {
      await updateTechTalk(id, base);
    } else {
      const today = new Date().toISOString().slice(0, 10);

      const fullPayload: Omit<TechTalk, "id"> = {
        ...base,
        date: today,
        duration: "",                       
        likes: "0",
        comments: []
      };

      await createTechTalk(fullPayload);
    }

    await load();
    showModal = false;
    talkToEdit = null;
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
    {#if isAdmin}
      <button class="btn btn-blue" on:click={openCreate}>
        + New TechTalk
      </button>
    {/if}
  </div>
<div class="tt-list">
  {#each talks as talk (talk.id)}
    <TechTalksCards
      {talk}
      {isAdmin}
      onDownload={() => {}}
      onUpdate={handleUpdate}
      onDelete={handleDeleteRequest}
    />
  {/each}
</div>

  <CreateTechTalkModal
    open={showModal}
    saving={saving}
    {talkToEdit}
    on:close={() => { showModal = false; talkToEdit = null; }}
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
>   
  </ConfirmModal>
</section>
