<script lang="ts">
  import SearchInput from "@/components/UI/SearchInput.svelte";
  import SvelteIcon from "@/components/UI/SvelteIcon.svelte";
  import {
    formatDate,
    getStatusClass,
    getStatusText,
  } from "@/helpers/helperFunction";
  import pdfPng from "public/img/pdf.png";

  export let tabContent: any = null;
  export let activeTab: string = "";

  let searchValue: string = "";
  let filteredContent: any[] = [];

  interface TabItem {
    id?: number;
    title?: string;
    description?: string;
    status?: string;
    date?: string;
    updateDate?: string;
    createdDate?: string;
    author?: string;
    presenter?: string;
    duration_min?: number;
    location?: string;
    likes?: string;
    comments?: Array<any>;
    analyst?: string;
    Developer?: string;
    documentsUrl?: string;
    video_url?: string;
    thumbnail_url?: string;
    file_url?: string;
  }

  function getIconNameForTab(tabType: string): string {
    switch (tabType.toLowerCase()) {
      case "tasks":
        return "taskIcon";
      case "techtalks":
        return "playIcon";
      case "documents":
        return "pdf";
      case "reports":
        return "pdf";
      case "ideas":
        return "lightbulb";
      default:
        return "playIcon";
    }
  }

  function handleSearch(event: CustomEvent) {
    const { results } = event.detail;
    filteredContent = results;
  }

  function getSearchFields(tabType: string): string[] {
    switch (tabType.toLowerCase()) {
      case "tasks":
        return ["title", "description", "status", "analyst", "Developer"];
      case "techtalks":
        return ["title", "description", "presenter", "location"];
      case "documents":
        return ["title", "description", "author"];
      case "reports":
        return ["title", "description", "author"];
      case "ideas":
        return ["title", "description"];
      default:
        return ["title", "description"];
    }
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
        placeholder="İçeriklerde ara..."
        width="100%"
        data={tabContent}
        searchFields={getSearchFields(activeTab)}
        on:search={handleSearch}
        on:clear={() => (filteredContent = tabContent)}
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
            <li class="content-item">
              <div class="item-icon">
                <div class={getIconNameForTab(activeTab)}>
                  {#if item.thumbnail_url}
                    <img
                      class="thumbnail"
                      src={item.thumbnail_url}
                      alt={item.title}
                    />
                  {:else if getIconNameForTab(activeTab) === "pdf"}
                    <img class="pdfPng" src={pdfPng.src} alt="PDF Icon" />
                  {:else}
                    <SvelteIcon
                      name={getIconNameForTab(activeTab)}
                      width={16}
                      height={70}
                    />
                  {/if}
                </div>
              </div>

              <div class="item-content">
                <div class="item-header">
                  {#if item.title}
                    <h3 class="item-title">{item.title}</h3>
                  {/if}
                  {#if item.status}
                    <span class="task-status {getStatusClass(item.status)}">
                      {getStatusText(item.status)}
                    </span>
                  {/if}
                </div>

                {#if item.description}
                  <p class="item-description">{item.description}</p>
                {/if}

                {#if item.analyst || item.Developer}
                  <div class="item-roles">
                    {#if item.analyst}
                      <span class="role-info analyst"
                        >Analyst: {item.analyst}</span
                      >
                    {/if}
                    {#if item.Developer}
                      <span class="role-info developer"
                        >Developer : {item.Developer}</span
                      >
                    {/if}
                  </div>
                {/if}

                <div class="item-meta">
                  {#if item.date}
                    <span class="item-date">
                      <SvelteIcon name="clock" width={12} height={12} />
                      {formatDate(item.date)}
                    </span>
                    <span class="item-separator">•</span>
                  {/if}

                  {#if item.location}
                    <span class="item-info">📍 {item.location}</span>
                    <span class="item-separator">•</span>
                  {/if}

                  {#if item.duration_min}
                    <span class="item-info">⏱️ {item.duration_min} dk</span>
                    <span class="item-separator">•</span>
                  {/if}

                  {#if item.presenter}
                    <span class="item-info">
                      <SvelteIcon name="mic" width={12} height={12} />
                      {item.presenter}
                    </span>
                    <span class="item-separator">•</span>
                  {/if}

                  {#if item.author}
                    <span class="item-info">👤 {item.author}</span>
                    <span class="item-separator">•</span>
                  {/if}

                  {#if item.likes}
                    <span class="item-likes">
                      <SvelteIcon name="like" width={12} height={12} />
                      {item.likes}
                    </span>
                    <span class="item-separator">•</span>
                  {/if}

                  {#if item.comments && Array.isArray(item.comments)}
                    <span class="item-comments">
                      <SvelteIcon name="comment" width={12} height={12} />
                      {item.comments.length}
                    </span>
                  {/if}
                </div>
              </div>

              {#if item.video_url || item.file_url || item.documentsUrl}
                <div class="item-action">
                  <button
                    on:click={() =>
                      window.open(
                        item.video_url || item.file_url || item.documentsUrl,
                        "_blank",
                      )}
                  >
                    <SvelteIcon name="download" width={20} height={20} />
                  </button>
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {:else if searchValue.length > 0}
        <div class="no-results">
          <p>Arama kriterlerinize uygun sonuç bulunamadı.</p>
          <p class="search-suggestion">Farklı anahtar kelimeler deneyin.</p>
        </div>
      {:else}
        <div class="no-content">
          <p>Bu bölümde henüz içerik bulunmuyor.</p>
        </div>
      {/if}
    {/if}
  </div>
{:else}
  <div class="no-content">
    <p>İçerik yükleniyor...</p>
  </div>
{/if}

<style>
  .no-results {
    text-align: center;
    padding: 2rem;
    color: #64748b;
  }

  .search-suggestion {
    font-size: 0.875rem;
    margin-top: 0.5rem;
    opacity: 0.8;
  }

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
</style>
