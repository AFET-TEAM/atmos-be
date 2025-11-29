<script lang="ts">
  import "./DynamicCard.scss";
  import Icon from "../UI/Icon.svelte";
 import type { IconName } from "../../types/IconTypes/Icontypes";

  export let imgSrc: string = "";
  export let title: string = "";
  export let titleHref: string = "";
  export let description: string = "";
  export let owner: string = "";
  export let isAdmin: boolean = false;
  export let ownerIcon: IconName = "owner"

  type CardAction = {
    label: string;
    onClick: () => void;
    variant?: "blue" | "green" | "red";
    adminOnly?: boolean;
  icon?: IconName; 
    disabled?: boolean;
  };
  export let actions: CardAction[] = [];

  $: visibleActions = actions.filter(a => !a.adminOnly || isAdmin);
</script>

<div class="tt-card">
  <img class="tt-thumb" src={imgSrc} alt={title} />

  <div class="tt-body">
    <a class="tt-title" href={titleHref}>{title}</a>

    <div class="tt-name">{description}</div>

    <div class="tt-owner">
     <Icon name={ownerIcon} width={14} height={14} />
      <span>{owner}</span>
    </div>
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
