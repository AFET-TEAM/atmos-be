<script lang="ts">
  import dayjs from "dayjs";
  import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
  import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
  import { onMount } from "svelte";
  dayjs.extend(isSameOrBefore);
  dayjs.extend(isSameOrAfter);

  import IdeasCard from "../IdeasCard/IdeasCard.svelte";
  import IdeasControls from "../IdeasControls/IdeasControls.svelte";
  import IdeasModal from "../IdeasModal/IdeasModal.svelte";

  import {
    approveIdea as svcApproveIdea,
    createIdea as svcCreateIdea,
    deleteIdea as svcDeleteIdea,
    fetchIdeas as svcFetchIdeas,
    joinBackend as svcJoinBackend,
    joinFrontend as svcJoinFrontend,
    rejectIdea as svcRejectIdea,
    updateIdea as svcUpdateIdea,
    type Idea
  } from "../../../api/IdeasApi";

  import ConfirmModal from "@/components/UI/ConfirmModal.svelte";
  import { checkAuth, currentUser as getCurrentUser } from "@/utils/user";
  import type { CurrentUser, RawIdeaFromApi } from "../types/IdeasTypes";

  function isCompleted(date: string) {
    return !!date && dayjs(date).isSameOrBefore(dayjs(), "day");
  }
  function isUpcoming(date: string) {
    return !!date && dayjs(date).isSameOrAfter(dayjs().add(1, "day"), "day");
  }

  let currentUser: CurrentUser | null = null;
  let isAdmin = false;
  let isUser = false;

  let ideas: Idea[] = [];
  let isModalOpen = false;
  let isEditMode = false;
  let selectedIdea: Idea | null = null;

  let ideaTitle = "";
  let date = "";
  let description = "";
  let presentationFileName: string | undefined;
  let frontendCount: number | undefined;
  let backendCount: number | undefined;
  let ownerName = "";

  let confirmOpen = false;
  let confirmMode: "approve" | "reject" | "delete" | null = null;
  let confirmIdeaId: number | null = null;
  let confirmBusy = false;

  const isApproved = (idea: Idea) => (idea.approvedBy?.length ?? 0) >= 1;
  const isPending = (idea: Idea) => (idea.approvedBy?.length ?? 0) === 0;

  const PAGE_SIZE = 4;
  let pendingPage = 1;

  let sortOrder: "az" | "za" = "az";
  let searchTerm = "";
  let modalReadOnly = false;

  function mapIdea(item: RawIdeaFromApi): Idea {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      date: item.date,
      owner: "",
      ownerId: String(item.userId),
      presentationFileName: item.fileUrl,
      frontendCount: item.frontendCount,
      backendCount: item.backendCount,
      approvedBy: item.approvedBy ?? [],
      frontendParticipants: item.frontendParticipants ?? [],
      backendParticipants: item.backendParticipants ?? []
    };
  }

  $: sortedApproved = ideas
    .filter(isApproved)
    .filter((i) =>
      i.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "az"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    );

  $: allPending = ideas
    .filter(isPending)
    .filter((i) =>
      i.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "az"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    );

  $: myId = currentUser?.id ?? "";

  $: pendingForAdmin = allPending;

  $: pendingForUser = allPending.filter(
    (i) => i.ownerId && i.ownerId === myId
  );

  $: activePending = isAdmin
    ? pendingForAdmin
    : currentUser
    ? pendingForUser
    : allPending;

  $: totalPendingPages = Math.ceil(activePending.length / PAGE_SIZE);
  $: displayedPending = activePending.slice(0, pendingPage * PAGE_SIZE);

  $: {
    if (!isEditMode) {
      modalReadOnly = false;
    } else if (isAdmin) {
      modalReadOnly = false;
    } else if (selectedIdea && currentUser) {
      const isMyIdea = selectedIdea.ownerId === currentUser.id;
      const isPending = (selectedIdea.approvedBy?.length ?? 0) === 0;
      modalReadOnly = !(isMyIdea && isPending);
    } else {
      modalReadOnly = true;
    }
  }

  $: confirmTitle =
    confirmMode === "approve"
      ? "Are you sure you want to approve this idea?"
      : confirmMode === "reject"
      ? "Are you sure you want to reject this idea?"
      : confirmMode === "delete"
      ? "Are you sure you want to delete this idea?"
      : "Are you sure?";

  function showMorePending() {
    if (pendingPage < totalPendingPages) pendingPage++;
  }
  function showLessPending() {
    pendingPage = 1;
  }

  async function reloadIdeas() {
    try {
      const raw = await svcFetchIdeas();
      ideas = raw.map(mapIdea);
    } catch (err) {
      console.error("Fetch ideas error:", err);
    }
  }

  async function init() {
    try {
      const rawUser = getCurrentUser();
      const authenticated = checkAuth();

      if (authenticated && rawUser) {
        currentUser = {
          id: String(rawUser.id),
          name: rawUser.full_name ?? rawUser.email ?? "",
          role: rawUser.role ?? "user"
        } as CurrentUser;

        isAdmin = currentUser.role === "admin";
        isUser = currentUser.role === "user";
        ownerName = currentUser.name;
      } else {
        currentUser = null;
        isAdmin = false;
        isUser = false;
        ownerName = "";
      }

      await reloadIdeas();
      pendingPage = 1;
    } catch (err) {
      console.error("Init error:", err);
    }
  }

  onMount(init);

  function openModal() {
    isModalOpen = true;
    isEditMode = false;
    selectedIdea = null;
    ideaTitle = "";
    date = "";
    description = "";
    presentationFileName = undefined;
    frontendCount = undefined;
    backendCount = undefined;
    ownerName = currentUser?.name ?? "";
  }

  function editIdea(idea: Idea) {
    selectedIdea = idea;
    isEditMode = true;
    isModalOpen = true;
    ideaTitle = idea.title;
    ownerName = idea.owner;
    date = idea.date;
    description = idea.description;
    frontendCount = idea.frontendCount;
    backendCount = idea.backendCount;
  }

  async function submitIdea() {
    try {
      if (!currentUser) return;

      const base = {
        title: ideaTitle,
        owner: ownerName || currentUser.name,
        ownerId: currentUser.id,
        date,
        description,
        presentationFileName,
        frontendCount,
        backendCount
      };

      if (!isEditMode) {
        await svcCreateIdea({
          ...base,
          approvedBy: []
        });
      } else if (selectedIdea) {
        await svcUpdateIdea(selectedIdea.id, {
          ...base
        });
      }

      await reloadIdeas();
      isModalOpen = false;
      pendingPage = 1;
    } catch (err) {
      console.error("Submit error:", err);
    }
  }

  async function doApprove(id: number) {
    if (!currentUser) return;
    try {
      await svcApproveIdea(id, currentUser.name);
      await reloadIdeas();
      isModalOpen = false;
      pendingPage = 1;
    } catch (err) {
      console.error("Approve error:", err);
    }
  }

  async function doReject(id: number) {
    try {
      await svcRejectIdea(id);
      await reloadIdeas();
      isModalOpen = false;
      pendingPage = 1;
    } catch (err) {
      console.error("Reject error:", err);
    }
  }

  async function doDelete(id: number) {
    try {
      await svcDeleteIdea(id);
      await reloadIdeas();
      isModalOpen = false;
      pendingPage = 1;
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  function requestApprove(id: number) {
    confirmIdeaId = id;
    confirmMode = "approve";
    confirmOpen = true;
  }

  function requestReject(id: number) {
    confirmIdeaId = id;
    confirmMode = "reject";
    confirmOpen = true;
  }

  function requestDelete(id: number) {
    confirmIdeaId = id;
    confirmMode = "delete";
    confirmOpen = true;
  }

  function resetConfirm() {
    confirmOpen = false;
    confirmMode = null;
    confirmIdeaId = null;
    confirmBusy = false;
  }

  async function handleConfirm() {
    if (confirmIdeaId == null || !confirmMode) {
      resetConfirm();
      return;
    }

    confirmBusy = true;
    try {
      if (confirmMode === "approve") {
        await doApprove(confirmIdeaId);
      } else if (confirmMode === "reject") {
        await doReject(confirmIdeaId);
      } else if (confirmMode === "delete") {
        await doDelete(confirmIdeaId);
      }
    } finally {
      resetConfirm();
    }
  }

  function handleCancelConfirm() {
    resetConfirm();
  }

  async function onJoinFrontend(id: number) {
    try {
      if (!currentUser) return;
      await svcJoinFrontend(id, currentUser.id);
      await reloadIdeas();
    } catch (err) {
      console.error("Join frontend error:", err);
    }
  }

  async function onJoinBackend(id: number) {
    try {
      if (!currentUser) return;
      await svcJoinBackend(id, currentUser.id);
      await reloadIdeas();
    } catch (err) {
      console.error("Join backend error:", err);
    }
  }
</script>

<section>
  <IdeasControls bind:sortOrder bind:searchTerm />
    <IdeasCard
      {isAdmin}
      {displayedPending}
      {totalPendingPages}
      {pendingPage}
      onShowMorePending={showMorePending}
      onShowLessPending={showLessPending}
      onEditIdea={editIdea}
      {sortedApproved}
      onOpenModal={openModal}
      {isCompleted}
      {isUpcoming}
      onJoinFrontend={onJoinFrontend}
      onJoinBackend={onJoinBackend}
      currentUserId={currentUser?.id}
    />

    <IdeasModal
      bind:isModalOpen
      {isEditMode}
      {selectedIdea}
      readOnly={modalReadOnly}
      {isAdmin}
      bind:ownerName
      bind:ideaTitle
      bind:date
      bind:description
      {presentationFileName}
      bind:frontendCount
      bind:backendCount
      onChangeFile={(e) => {
        const target = e.target as HTMLInputElement;
        if (target?.files?.[0]) {
          presentationFileName = target.files[0].name;
        }
      }}
      onSubmitIdea={submitIdea}
      onApproveIdea={requestApprove}
      onRejectIdea={requestReject}
      onDeleteIdea={requestDelete}
    />

    <ConfirmModal
      open={confirmOpen}
      title={confirmTitle}
      message=""
      confirmText="Yes"
      cancelText="No"
      disabled={confirmBusy}
      on:confirm={handleConfirm}
      on:cancel={handleCancelConfirm}
      on:close={handleCancelConfirm}
    />

</section>
