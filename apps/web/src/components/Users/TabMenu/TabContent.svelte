<script lang="ts">
  import SearchInput from "@/components/UI/SearchInput.svelte";
  import pdfPng from "public/img/pdf.png";
  import ContentItem from "./ContentItem.svelte";

  export let tabContent: any = null;
  export let activeTab: string = "";

  let searchValue: string = "";
  let filteredContent: any[] = [];

  const TAB_CONFIG: Record<string, { icon: string; searchFields: string[] }> = {
    tasks: {
      icon: "taskIcon",
      searchFields: ["title", "description", "status", "analyst", "Developer"],
    },
    techtalks: {
      icon: "playIcon",
      searchFields: ["title", "description", "presenter", "location"],
    },
    documents: {
      icon: "pdf",
      searchFields: ["title", "description", "author"],
    },
    reports: {
      icon: "pdf",
      searchFields: ["title", "description", "author"],
    },
    ideas: {
      icon: "lightbulb",
      searchFields: ["title", "description"],
    },
  };

  function getTabConfig(tabType: string) {
    return TAB_CONFIG[tabType.toLowerCase()] || TAB_CONFIG.techtalks;
  }

  function getIconNameForTab(tabType: string): string {
    return getTabConfig(tabType).icon;
  }

  function getSearchFields(tabType: string): string[] {
    return getTabConfig(tabType).searchFields;
  }

  function handleSearch(event: CustomEvent) {
    const { results } = event.detail;
    filteredContent = results;
  }

  function handleClear() {
    filteredContent = Array.isArray(tabContent) ? tabContent : [];
  }

  $: if (Array.isArray(tabContent)) {
    filteredContent = tabContent;
  }
</script>

{#if tabContent}
  <div class="content-section">
    {#if Array.isArray(tabContent)}
      <SearchInput
        bind:value={searchValue}
        placeholder="Search content..."
        width="100%"
        data={tabContent}
        searchFields={getSearchFields(activeTab)}
        on:search={handleSearch}
        on:clear={handleClear}
      />
    {/if}

    {#if activeTab === "AboutMe"}
      <div class="aboutme-section">
        {#if tabContent.content && Array.isArray(tabContent.content)}
          {#each tabContent.content as item}
            <div class="aboutme-content">
              {#if item.title}
                <h3 class="aboutme-title">{item.title}</h3>
              {/if}
              <p class="aboutme-text">{item.description}</p>
            </div>
          {/each}
        {/if}
      </div>
    {:else if Array.isArray(tabContent)}
      {#if filteredContent.length > 0}
        <ul class="content-list">
          {#each filteredContent as item (item.id)}
            <ContentItem
              {item}
              {activeTab}
              iconName={getIconNameForTab(activeTab)}
              {pdfPng}
            />
          {/each}
        </ul>
      {:else if searchValue.length > 0}
        <div class="no-results">
          <p>No results match your search criteria.</p>
          <p class="search-suggestion">Try different keywords.</p>
        </div>
      {:else}
        <div class="no-content">
          <p>No content available in this section yet.</p>
        </div>
      {/if}
    {/if}
  </div>
{:else}
  <div class="no-content">
    <p>Loading content...</p>
  </div>
{/if}
