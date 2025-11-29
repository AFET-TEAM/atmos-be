<script lang="ts">
  import "./IdeasCard.scss";

  export let isAdmin: boolean;
  export let displayedPending: Array<any> = [];
  export let totalPendingPages: number = 0;
  export let pendingPage: number = 1;
  export let onShowMorePending: () => void;
  export let onShowLessPending: () => void;
  export let onEditIdea: (idea: any) => void;
  export let sortedApproved: Array<any> = [];
  export let onOpenModal: () => void;
  export let isCompleted: (date: string) => boolean;
  export let isUpcoming: (date: string) => boolean;
  export let onJoinFrontend: (id: number) => void;
  export let onJoinBackend: (id: number) => void;

  export let currentUserId: string | undefined;

  const isJoined = (list?: string[], uid?: string) =>
    !!uid && Array.isArray(list) && list.includes(uid);

  const isFull = (count?: number, list?: string[]) =>
    (count ?? 0) > 0 && (list?.length ?? 0) >= (count ?? 0);
</script>

{#if isAdmin && displayedPending.length}
  <div class="idea-section">
    <h3>Ideas Pending Approval</h3>
    <div class="cards-container">
      {#each displayedPending as idea (idea.id)}
        <button
          type="button"
          class="idea-item pending"
          on:click={() => onEditIdea(idea)}
          aria-label={`Open ${idea.title} for review`}
        >
          <p>{idea.title}</p>
        </button>
      {/each}
    </div>

    <div class="idea-section">
      {#if pendingPage < totalPendingPages}
        <button class="toggle-button" on:click={onShowMorePending} type="button">Show more</button>
      {/if}
      {#if pendingPage > 1}
        <button class="toggle-button" on:click={onShowLessPending} type="button">Show less</button>
      {/if}
    </div>
  </div>

  <hr style="border:1px solid #18a0fb; margin:20px 0;" />
{/if}

{#if isAdmin}<h3>Existing Ideas</h3>{/if}

<div class="cards-container">
  <button
    type="button"
    class="idea-card"
    on:click={onOpenModal}
    aria-label="Create a new idea"
  >
    <p>I Have an Idea!</p>
  </button>

  {#each sortedApproved as idea (idea.id)}
    <div
      class="idea-item"
      role="button"
      tabindex="0"
      on:click={() => onEditIdea(idea)}
      on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEditIdea(idea);
        }
      }}
      aria-label={`Open ${idea.title}`}
    >
      <p>{idea.title}</p>

      {#if isCompleted(idea.date) || isUpcoming(idea.date)}
        <div class="status-icon-wrapper" aria-hidden="true">
          {#if isCompleted(idea.date)}
            <svg class="status-icon completed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 11.03a.75.75 0 0 0 1.06 0l4-4a.75.75 0 1 0-1.06-1.06L7.5 9.44 5.53 7.47a.75.75 0 0 0-1.06 1.06l2.5 2.5z"/>
            </svg>
          {:else if isUpcoming(idea.date)}
            <svg class="status-icon ongoing" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffc900" viewBox="0 0 16 16">
              <path d="M8 3.5a.5.5 0 0 1 .5.5v3.25H11a.5.5 0 0 1 0 1H8a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z"/>
              <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8z"/>
            </svg>
          {/if}
        </div>
      {/if}

      <div class="idea-meta">
        <div class="need">
          {#key idea.frontendParticipants?.length}
            <span>FE: {idea.frontendParticipants?.length || 0}/{idea.frontendCount || 0}</span>
          {/key}

          {#if isJoined(idea.frontendParticipants, currentUserId)}
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Zaten Frontend ekibindesin"
              on:click|stopPropagation
            >
              Joined
            </button>
          {:else}
            <button
              type="button"
              on:click|stopPropagation={() => onJoinFrontend(idea.id)}
              disabled={(idea.frontendCount ?? 0) === 0 || isFull(idea.frontendCount, idea.frontendParticipants)}
              aria-disabled={(idea.frontendCount ?? 0) === 0 || isFull(idea.frontendCount, idea.frontendParticipants)}
              title={(idea.frontendCount ?? 0) === 0
                ? "Frontend ekibi kapalı"
                : (isFull(idea.frontendCount, idea.frontendParticipants) ? "Frontend ekibi dolu" : "Frontend ekibine katıl")}
            >
              Join Team
            </button>
          {/if}
        </div>

        <div class="need">
          {#key idea.backendParticipants?.length}
            <span>BE: {idea.backendParticipants?.length || 0}/{idea.backendCount || 0}</span>
          {/key}

          {#if isJoined(idea.backendParticipants, currentUserId)}
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Zaten Backend ekibindesin"
              on:click|stopPropagation
            >
              Joined
            </button>
          {:else}
            <button
              type="button"
              on:click|stopPropagation={() => onJoinBackend(idea.id)}
              disabled={(idea.backendCount ?? 0) === 0 || isFull(idea.backendCount, idea.backendParticipants)}
              aria-disabled={(idea.backendCount ?? 0) === 0 || isFull(idea.backendCount, idea.backendParticipants)}
              title={(idea.backendCount ?? 0) === 0
                ? "Backend ekibi kapalı"
                : (isFull(idea.backendCount, idea.backendParticipants) ? "Backend ekibi dolu" : "Backend ekibine katıl")}
            >
              Join Team
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>
