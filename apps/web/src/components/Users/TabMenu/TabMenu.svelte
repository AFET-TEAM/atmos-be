<script lang="ts">
  import { getTabNameForUserDetails, getUserTabDetails } from "@/api/UsersApi";
  import { onMount } from "svelte";
  import "./tabmenu.scss";

  interface TabHeader {
    id: number;
    name: string;
    value?: string;
  }

  let { children, userId } = $props();

  let tabContent = $state(null);
  let loading = $state(false);
  let error = $state(null);
  let activeTab = $state("documents");
  let tabsHeader = $state<TabHeader[]>([]);
  let isInitialized = $state(false);

  const TabsHeader = async () => {
    const data = await getTabNameForUserDetails();

    tabsHeader = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      value: item.name.toLowerCase().replace(/\s+/g, ""),
    }));
  };

  onMount(() => {
    TabsHeader();
  });

  $effect(() => {
    console.log("tabsHeader güncellendi:", tabsHeader);

    if (tabsHeader?.length > 0 && !isInitialized) {
      isInitialized = true;
      const firstTab = tabsHeader[0];
      activeTab = firstTab.value || "documents";
      console.log("İlk tab yükleniyor:", activeTab);
      handleTabClick(firstTab);
    }
  });

  async function handleTabClick(tab: TabHeader) {
    const tabValue = tab?.value;
    console.log(
      "handleTabClick çağrıldı, tab:",
      tabValue,
      "activeTab:",
      activeTab,
    );

    if (tabValue && activeTab === tabValue) {
      console.log("Aynı tab'a tıklandı, işlem yapılmıyor");
      return;
    }

    if (tabValue) {
      activeTab = tabValue;
    }

    loading = true;
    error = null;

    try {
      const tabToFetch = tabValue || activeTab;

      const response = await getUserTabDetails(tabToFetch, userId);

      if (response && response.data) {
        tabContent = response.data;
      } else if (Array.isArray(response)) {
        tabContent = response;
      } else {
        tabContent = response;
      }
    } catch (err: any) {
      console.error("Tab content error:", err);
    } finally {
      loading = false;
    }
  }
</script>

<section>
  <div class="tab-container">
    <div class="tab-links">
      {#each tabsHeader as tab (tab.id)}
        <button
          onclick={() => handleTabClick(tab)}
          class="tab-links-button {activeTab === tab.value
            ? 'active'
            : 'inactive'}"
        >
          {tab.name}
        </button>
      {/each}
    </div>

    <div class="tab-content">
      {#if loading}
        <div class="loading">Loading...</div>
      {:else if error}
        <div class="error">{error}</div>
      {:else if tabContent}
        {@render children({ tabContent, activeTab })}
      {:else}
        <div class="no-content">No content available</div>
      {/if}
    </div>
  </div>
</section>
