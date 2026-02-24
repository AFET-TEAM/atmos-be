<script lang="ts">
  import Icon from "@/components/UI/Icon.svelte";
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

const isMine = (ownerId?: string | number, meId?: string) =>
  !!ownerId && !!meId && String(ownerId) === String(meId);
</script>

    {#if displayedPending.length}
      <div class="idea-section">
        <h3>
          {#if isAdmin}
            Ideas Pending Approval
          {:else}
            My Pending Ideas
          {/if}
        </h3>

        <div class="cards-container">
          {#each displayedPending as idea (idea.id)}
            <button
              type="button"
              class="idea-item pending {idea.status === 'rejected' ? 'is-rejected' : ''}"
              on:click={() => onEditIdea(idea)}
              aria-label={`Open ${idea.title} for review`}>
              <p>{idea.title}</p>

              <div class="top-right" aria-hidden="true">
                {#if idea.status === 'rejected'}
                  <Icon name="close" width={16} height={16} color="red" />
                {/if}
              </div>
            </button>
          {/each}
        </div>

        <div class="idea-section">
          {#if pendingPage < totalPendingPages}
            <button
              class="toggle-button"
              on:click={onShowMorePending}
              type="button">
              Show more
            </button>
          {/if}
          {#if pendingPage > 1}
            <button
              class="toggle-button"
              on:click={onShowLessPending}
              type="button">
              Show less
            </button>
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
          aria-label="Create a new idea">
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
            aria-label={`Open ${idea.title}`} >
            <p>{idea.title}</p>

            <div class="top-right">
        {#if isCompleted(idea.date) || isUpcoming(idea.date)}
          <div class="status-icons" aria-hidden="true">
            {#if isCompleted(idea.date)}
            <Icon name="completed" width={16} height={16} color="green" />
            {:else if isUpcoming(idea.date)}
               <Icon name="ongoing" width={16} height={16} color="#cccc00" />
            {/if}
          </div>
        {/if}

        {#if isMine(idea.ownerId, currentUserId)}
        <span class="card-tag" aria-label="Created by you">Me</span>
      {/if}
      </div>
      <div class="idea-meta">
        <div class="need">
          {#key idea.frontendParticipants?.length}
            <span>Frontend: {idea.frontendParticipants?.length || 0}/{idea.frontendCount || 0}</span>
          {/key}

          {#if isJoined(idea.frontendParticipants, currentUserId)}
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Zaten Frontend ekibindesin"
              on:click|stopPropagation>
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
                : (isFull(idea.frontendCount, idea.frontendParticipants) ? "Frontend ekibi dolu" : "Frontend ekibine katıl")}>
              Join Team
            </button>
          {/if}
        </div>

        <div class="need">
          {#key idea.backendParticipants?.length}
            <span>Backend: {idea.backendParticipants?.length || 0}/{idea.backendCount || 0}</span>
          {/key}

          {#if isJoined(idea.backendParticipants, currentUserId)}
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Zaten Backend ekibindesin"
              on:click|stopPropagation>
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
                : (isFull(idea.backendCount, idea.backendParticipants) ? "Backend ekibi dolu" : "Backend ekibine katıl")}>
              Join Team
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>
