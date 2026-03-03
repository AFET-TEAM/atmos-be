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
  let isSupervisor = false;
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

  const isApproved = (idea: Idea) => idea.status === "approved";
  const isPendingOrRejected = (idea: Idea) =>
    idea.status === "pending" || idea.status === "rejected";

  const PAGE_SIZE = 4;
  let pendingPage = 1;

  let sortOrder: "az" | "za" = "az";
  let searchTerm = "";
  let modalReadOnly = false;

  $: isMyIdea =
    !!selectedIdea && !!currentUser && selectedIdea.ownerId === currentUser.id;

  $: isPendingIdea = !!selectedIdea && selectedIdea.status === "pending";

  $: isAdminOrSupervisor = isAdmin || isSupervisor;

  $: canUpdate =
    isEditMode && isPendingIdea && (isMyIdea || isAdminOrSupervisor);

  $: canModerate = isEditMode && isAdminOrSupervisor && isPendingIdea;

  $: canDelete =
    isEditMode && !!selectedIdea && (isMyIdea || isAdminOrSupervisor);

  $: modalReadOnly = isEditMode && !canUpdate && !canModerate;

  function mapIdea(item: RawIdeaFromApi): Idea {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      date: item.date,
      owner: "",
      ownerId: String(item.userId),
      presentationFileName: item.fileUrl,
      fileUrl: item.fileUrl ?? null,
      fileName: item.fileName ?? null,
      fileData: item.fileData ?? null,
      frontendCount: item.frontendCount,
      backendCount: item.backendCount,
      status: item.status,
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
    .filter(isPendingOrRejected)
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
        isSupervisor = String(currentUser.role) === "supervisor";
        isUser = currentUser.role === "user";
        ownerName = currentUser.name;
      } else {
        currentUser = null;
        isAdmin = false;
        isSupervisor = false;
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

  async function openModal() {
    isModalOpen = true;
    isEditMode = false;
    selectedIdea = null;
    ideaTitle = "";
    date = "";
    description = "";
    presentationFileName = undefined;
    frontendCount = undefined;
    backendCount = undefined;
    
    // Always fetch fresh user data when opening create modal
    try {
      const freshUser = await fetchCurrentUser();
      if (freshUser) {
        ownerName = freshUser.name;
        currentUser = freshUser;
      } else {
        ownerName = currentUser?.name ?? "Unknown User";
      }
    } catch {
      ownerName = currentUser?.name ?? "Unknown User";
    }
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
    {canUpdate}
    {canModerate}
    {canDelete}
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
