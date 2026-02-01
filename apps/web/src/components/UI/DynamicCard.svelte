<script lang="ts">
  import { getUserById } from "@/api/UsersApi";
  import type { IconName } from "../../types/IconTypes/Icontypes";
  import Icon from "../UI/Icon.svelte";
  import "./DynamicCard.scss";

  export let imgSrc: string = "";
  export let title: string = "";
  export let titleHref: string = "";
  export let description: string = "";
  export let owner: string = "";
  export let isAdmin: boolean = false;
  export let ownerIcon: IconName = "users";

  type CardAction = {
    label: string;
    onClick: () => void;
    variant?: "blue" | "green" | "red";
    adminOnly?: boolean;
    icon?: IconName;
    disabled?: boolean;
  };

  export let actions: CardAction[] = [];
  $: createdUser = getUserById(owner);
  $: visibleActions = actions.filter((a) => !a.adminOnly || isAdmin);
</script>

<div class="tt-card">
  <img class="tt-thumb" src={imgSrc} alt={title} />

  <div class="tt-body">
    {#if titleHref}
  <a class="tt-title" href={titleHref}>{title}</a>
{:else}
  <div class="tt-title tt-title--plain">{title}</div>
{/if}

    <div class="tt-name">{description}</div>

    {#if owner}
  <div class="tt-owner">
    <Icon name={ownerIcon} width={14} height={14} />
    {#await createdUser}
      <span>Loading...</span>
    {:then user}
      <span>{user?.fullName}</span>
    {/await}
  </div>
{/if}
  </div>

  <div class="tt-actions">
    {#each visibleActions as a}
      <button
        class={`btn ${a.variant ? "btn-" + a.variant : ""}`}
        on:click={a.onClick}
        disabled={a.disabled}
        aria-disabled={a.disabled ? "true" : "false"}
        type="button"
      >
        <Icon name={a.icon ?? "download"} width={14} height={14} />
        <span>{a.label}</span>
      </button>
    {/each}
  </div>
</div>
