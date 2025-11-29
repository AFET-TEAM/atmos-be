<script lang="ts">
  import { onMount } from 'svelte';
  import dayjs from 'dayjs';
  import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
  import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
  dayjs.extend(isSameOrBefore);
  dayjs.extend(isSameOrAfter);

  import IdeasControls from '../IdeasControls/IdeasControls.svelte';
  import IdeasCard from '../IdeasCard/IdeasCard.svelte';
  import IdeasModal from '../IdeasModal/IdeasModal.svelte';

  import {
    fetchIdeas as svcFetchIdeas,
    createIdea as svcCreateIdea,
    approveIdea as svcApproveIdea,
    rejectIdea as svcRejectIdea,
    deleteIdea as svcDeleteIdea,
    joinFrontend as svcJoinFrontend,
    joinBackend as svcJoinBackend, 
    type Idea
  } from '../../../api/IdeasApi';

  import { fetchCurrentUser } from '../../../api/IdeasApi';
  import type { CurrentUser } from '../types/IdeasTypes';

  function isCompleted(date: string) {
    return !!date && dayjs(date).isSameOrBefore(dayjs(), 'day');
  }
  function isUpcoming(date: string) {
    return !!date && dayjs(date).isSameOrAfter(dayjs().add(1, 'day'), 'day');
  }

  let currentUser: CurrentUser | null = null;
  let isAdmin = false;
  let isUser = false;

  let ideas: Idea[] = [];
  let isModalOpen = false;
  let isEditMode = false;
  let selectedIdea: Idea | null = null;

  let ideaTitle = '';
  let date = '';
  let description = '';
  let presentationFileName: string | undefined;
  let frontendCount: number | undefined;
  let backendCount: number | undefined;
  let ownerName = '';

  const isApproved = (idea: Idea) => idea.approvedBy.length >= 1;
  const isPending = (idea: Idea) => idea.approvedBy.length === 0;

  const PAGE_SIZE = 4;
  let pendingPage = 1;

  let sortOrder: 'az' | 'za' = 'az';
  let searchTerm = '';

  $: sortedApproved = ideas
    .filter(isApproved)
    .filter(i => i.title.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .sort((a, b) => (sortOrder === 'az' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));

  $: sortedPending = ideas
    .filter(isPending)
    .filter(i => i.title.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .sort((a, b) => (sortOrder === 'az' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));

  $: totalPendingPages = Math.ceil(sortedPending.length / PAGE_SIZE);
  $: displayedPending = sortedPending.slice(0, pendingPage * PAGE_SIZE);

  function showMorePending() {
    if (pendingPage < totalPendingPages) pendingPage++;
  }
  function showLessPending() {
    pendingPage = 1;
  }

  async function init() {
    try {
      const [user, ideasData] = await Promise.all([fetchCurrentUser(), svcFetchIdeas()]);
      currentUser = user;
      isAdmin = user.role === 'admin';
      isUser = user.role === 'user';
      ownerName = user.name;
      ideas = ideasData;
    } catch (err) {
      console.error('Init error:', err);
    }
  }
  onMount(init);

  function openModal() {
    isModalOpen = true;
    isEditMode = false;
    selectedIdea = null;
    ideaTitle = '';
    date = '';
    description = '';
    presentationFileName = undefined;
    frontendCount = undefined;
    backendCount = undefined;
    ownerName = currentUser?.name ?? '';
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

  async function fetchIdeas() {
    try {
      ideas = await svcFetchIdeas();
    } catch (err) {
      console.error('Fetch ideas error:', err);
    }
  }

  async function submitIdea() {
    try {
      await svcCreateIdea({
        title: ideaTitle,
        owner: currentUser?.name ?? '',
        date,
        description,
        presentationFileName,
        frontendCount,
        backendCount
      });
      await fetchIdeas();
      isModalOpen = false;
      pendingPage = 1;
    } catch (err) {
      console.error('Submit error:', err);
    }
  }

  async function onApprove(id: number) {
    if (!currentUser) return;
    try {
      await svcApproveIdea(id, currentUser.name);
      await fetchIdeas();
      isModalOpen = false;
      pendingPage = 1;
    } catch (err) {
      console.error('Approve error:', err);
    }
  }

  async function onReject(id: number) {
    try {
      await svcRejectIdea(id);
      await fetchIdeas();
      isModalOpen = false;
      pendingPage = 1;
    } catch (err) {
      console.error('Reject error:', err);
    }
  }

  async function onDelete(id: number) {
    try {
      await svcDeleteIdea(id);
      await fetchIdeas();
      isModalOpen = false;
      pendingPage = 1;
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

async function onJoinFrontend(id: number) {
  try {
    if (!currentUser) return;                    
    await svcJoinFrontend(id, currentUser.id);   
    await fetchIdeas();
  } catch (err) {
    console.error('Join frontend error:', err);
  }
}

async function onJoinBackend(id: number) {
  try {
    if (!currentUser) return;                    
    await svcJoinBackend(id, currentUser.id);   
    await fetchIdeas();
  } catch (err) {
    console.error('Join backend error:', err);
  }
}

</script>

<section>
  {#if isUser || isAdmin}
    <IdeasControls bind:sortOrder bind:searchTerm />
  {/if}


  {#if isUser || isAdmin}
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
  {/if}

  <IdeasModal
    bind:isModalOpen
    {isEditMode}
    {selectedIdea}
    readOnly={isUser && isEditMode}
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
    onApproveIdea={onApprove}
    onRejectIdea={onReject}
    onDeleteIdea={onDelete}
  />
</section>
