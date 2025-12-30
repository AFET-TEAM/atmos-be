<script lang="ts">
  import Icon from "../../UI/Icon.svelte";
  import type { TechTalk } from "../types/TechTalks";
  import "./TechtalkSideList.scss";

  export let items: TechTalk[] = [];
  export let activeId: number | undefined;

  const fmt = (d?: string) => {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString("tr-TR");
  };
</script>

<aside class="tt-side">
  {#if items.length === 0}
    <div class="tt-side__empty">Diğer techtalk bulunamadı.</div>
  {:else}
    {#each items as o (o.id)}
      <a
        class="tt-side__item {activeId === o.id ? 'is-active' : ''}"
        href={`/techtalks/${o.id}`}
        title={o.title}
        aria-current={activeId === o.id ? "page" : undefined}
      >
        <div class="tt-side__thumb">
          {#if o.thumbnailUrl}
            <img src={o.thumbnailUrl} alt={o.title} />
          {:else}
            <div class="tt-side__thumb-fallback"></div>
          {/if}
        </div>

        <div class="tt-side__info">
          <div class="tt-side__title">{o.title}</div>

          <div class="tt-side__meta">
            <span class="meta-item" title="Sahip">
              <Icon name="owner" width={14} height={14} />
              <span class="text">{o.owner}</span>
            </span>

            {#if (o as any).date}
              <span class="meta-item" title="Tarih">
                <Icon name="clock" width={14} height={14} />
                <span class="text"
                  >{fmt((o as any).date) ?? (o as any).date}</span
                >
              </span>
            {/if}
          </div>
        </div>
      </a>
    {/each}
  {/if}
</aside>
