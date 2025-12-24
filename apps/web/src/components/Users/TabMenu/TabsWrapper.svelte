<script lang="ts">
  import { getTabNameForUserDetails } from "@/api/UsersApi";
  import { onMount } from "svelte";
  import TabContent from "./TabContent.svelte";
  import TabMenu from "./TabMenu.svelte";

  type TabContentType = any;
  let tabsHeader: Array<{ value: string; name: string }> = [];

  const TabsHeader = async () => {
    tabsHeader = await getTabNameForUserDetails();
  };

  onMount(() => {
    TabsHeader();
  });
</script>

<TabMenu tabHeader={tabsHeader}>
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
