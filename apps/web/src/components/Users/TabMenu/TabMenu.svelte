<script>
  import { getUserTabDetails } from "@/api/UsersApi";
  import "./tabmenu.scss";
  let { tabHeader, children } = $props();
  let tabContent = $state(null);
  let loading = $state(false);
  let error = $state(null);
  let activeTab = $state("AboutMe");
  async function handleTabClick(tab) {
    if (tab?.value) {
      if (activeTab === tab.value) return;
      activeTab = tab.value;
    }
    loading = true;
    error = null;

    try {
      tabContent = await getUserTabDetails(activeTab);
    } catch (err) {
      error = "İçerik yüklenirken hata oluştu";
      console.error("Tab content error:", err);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    handleTabClick(); 
  });
</script>

<section>
  <div class="tab-container">
    <div class="tab-links">
      {#each tabHeader as tab}
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
        <div class="loading">Yükleniyor...</div>
      {:else if error}
        <div class="error">{error}</div>
      {:else if tabContent && children}
        {@render children({ tabContent, activeTab })}
      {/if}
    </div>
  </div>
</section>
