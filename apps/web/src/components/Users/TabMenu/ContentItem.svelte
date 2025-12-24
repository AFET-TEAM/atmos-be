<script lang="ts">
  import SvelteIcon from "@/components/UI/SvelteIcon.svelte";
  import {
    formatDate,
    getStatusClass,
    getStatusText,
  } from "@/helpers/helperFunction";

  export let item: any;
  export let activeTab: string;
  export let iconName: string;
  export let pdfPng: any;

  function handleDownload() {
    const url = item.video_url || item.file_url || item.documentsUrl;
    if (url) {
      window.open(url, "_blank");
    }
  }
</script>

<li class="content-item">
  <div class="item-icon">
    <div class={iconName}>
      {#if item.thumbnail_url}
        <img class="thumbnail" src={item.thumbnail_url} alt={item.title} />
      {:else if iconName === "pdf"}
        <img class="pdfPng" src={pdfPng.src} alt="PDF Icon" />
      {:else}
        <SvelteIcon name={iconName} width={16} height={70} />
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
          <span class="role-info analyst">Analyst: {item.analyst}</span>
        {/if}
        {#if item.Developer}
          <span class="role-info developer">Developer: {item.Developer}</span>
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
      <button on:click={handleDownload} title="İndir">
        <SvelteIcon name="download" width={20} height={20} />
      </button>
    </div>
  {/if}
</li>
