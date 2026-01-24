<script lang="ts">
  import type { IconName } from "../../types/IconTypes/Icontypes";
  import Icon from "./Icon.svelte";

  import "./ui.scss";
  export let iconName: IconName;
  export let text: string;
  export let buttonType: string;
  export let color: string = "black";
  export let border: boolean = false;
  export let className: string = "";
</script>

<button
  on:click
  class={`${className ? className : `icon-button-${buttonType}`}  ${border ? "bordered" : ""}`}
  style="color: {color}"
>
  {#if iconName}
    <Icon name={iconName} size={24} />
  {/if}
  {#if text}
    <span class={`${color}`}>{text}</span>
  {/if}
</button>
