<script lang="ts">
  import Icon from "./Icon.svelte";
  import type { IconName } from "../../types/IconTypes/Icontypes";
  import "./ui.scss";
  export let text: string;
  export let href: string;
  export let iconName: IconName;
  export let size: number;
  export let border: boolean;
</script>

<div class={`customLink ${border ? "bordered" : ""}`}>
  <Icon name={iconName} {size} />
  <a {href} class="customLinks"> {text} </a>
</div>
