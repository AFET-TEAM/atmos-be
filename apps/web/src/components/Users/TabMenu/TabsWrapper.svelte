<script lang="ts">
  import TabContent from "./TabContent.svelte";
  import TabMenu from "./TabMenu.svelte";
  let { userId } = $props();

  type TabContentType = any;
</script>

<TabMenu {userId}>
  {#snippet children({
    tabContent,
    activeTab,
  }: {
    tabContent: TabContentType;
    activeTab: string;
  })}
    <TabContent {tabContent} {activeTab} />
  {/snippet}
</TabMenu>
