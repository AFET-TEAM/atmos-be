<script lang="ts">
  import { getTabNameForUserDetails } from "@/api/UsersApi";
  import { onMount } from "svelte";
  import TabMenu from "./TabMenu.svelte";
  import TabContent from "./TabContent.svelte";

  type TabContentType = any;
  let tabsHeader: Array<{ value: string; name: string }> = [];

  onMount(async () => {
    try {
      const tabLinks = await getTabNameForUserDetails();
      tabsHeader = tabLinks?.map((tab: any) => ({
        value: tab.Value,
        name: tab.TabName,
      }));
      console.log("TabsWrapper:", tabsHeader);
    } catch (error) {
      console.error("Tab data loading error:", error);
    }
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
