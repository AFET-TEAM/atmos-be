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
    type Idea,
  } from "../../../api/IdeasApi";

  import { getUserById } from "@/api/UsersApi";
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
  let selectedFile: File | null = null;
  let frontendCount: number | undefined;
  let backendCount: number | undefined;
  let ownerName = "";

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
      backendParticipants: item.backendParticipants ?? [],
    };
  }

  $: sortedApproved = ideas
    .filter(isApproved)
    .filter((i) =>
      i.title.toLowerCase().includes(searchTerm.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sortOrder === "az"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title),
    );

  $: allPending = ideas
    .filter(isPending)
    .filter((i) =>
      i.title.toLowerCase().includes(searchTerm.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sortOrder === "az"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title),
    );

  $: myId = currentUser?.id ?? "";

  $: pendingForAdmin = allPending;

  $: pendingForUser = allPending.filter((i) => i.ownerId && i.ownerId === myId);

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
          role: rawUser.role ?? "user",
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

  async function editIdea(idea: Idea) {
    selectedIdea = idea;
    isEditMode = true;
    isModalOpen = true;

    ideaTitle = idea.title;
    date = idea.date?.split("T")[0] ?? "";
    description = idea.description;
    frontendCount = idea.frontendCount;
    backendCount = idea.backendCount;

    ownerName = "";
    try {
      const user = await getUserById(Number(idea.ownerId));
      ownerName = user?.fullName || user?.full_name || "";
    } catch {
      ownerName = "";
    }
  }

  async function submitIdea() {
    if (!currentUser) return;

    let fileBase64: string | undefined = undefined;
    let fileName: string | undefined = undefined;

    if (selectedFile) {
      fileName = selectedFile.name;
      const file = selectedFile; // null-safe reference

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
      user_id: Number(currentUser.id),
      title: ideaTitle,
      description,
      date,
      frontend_count: frontendCount,
      backend_count: backendCount,
      file_url: presentationFileName,
    };

    if (fileBase64) {
      payload.file_data = fileBase64;
      payload.file_name = fileName;
    }

    if (!isEditMode) {
      await svcCreateIdea(payload);
    } else if (selectedIdea) {
      await svcUpdateIdea(selectedIdea.id, payload);
    }

    await reloadIdeas();
    isModalOpen = false;
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
    {onJoinFrontend}
    {onJoinBackend}
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
        selectedFile = target.files[0];
        presentationFileName = target.files[0].name;
      }
    }}
    onSubmitIdea={submitIdea}
    onApproveIdea={doApprove}
    onRejectIdea={doReject}
    onDeleteIdea={doDelete}
  />
</section>
