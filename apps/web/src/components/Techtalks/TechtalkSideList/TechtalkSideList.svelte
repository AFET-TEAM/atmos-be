<script lang="ts">
  import { getUserById } from "@/api/UsersApi";
  import Icon from "../../UI/Icon.svelte";
  import type { TechTalk } from "../types/TechTalks";
  import "./TechtalkSideList.scss";

  export let items: TechTalk[] = [];
  export let activeId: number | undefined;
  const defaultImage = "/img/logo.png";

  const fmt = (d?: string) => {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString("tr-TR");
  };

  const slugify = (s: string) =>
    (s || "")
      .toLowerCase()
      .trim()
      .replaceAll("ğ", "g")
      .replaceAll("ü", "u")
      .replaceAll("ş", "s")
      .replaceAll("ı", "i")
      .replaceAll("ö", "o")
      .replaceAll("ç", "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const talkHref = (t: TechTalk) => `/techtalks/${slugify(t.title)}-${t.id}`;

  let ownerMap: Record<number, string> = {};
  let loadingOwners = false;

  const getTalkUserId = (t: any) => Number(t?.userId ?? t?.user_id ?? 0);

  async function loadOwners(list: any[]) {
    const ids = Array.from(new Set(list.map(getTalkUserId).filter((id) => id > 0)));

    const missing = ids.filter((id) => !ownerMap[id]);
    if (missing.length === 0) return;

    loadingOwners = true;

    try {
      const results = await Promise.all(
        missing.map(async (id) => {
          try {
            const u = await getUserById(id);
            const name = u?.fullName?.trim() || `User ${id}`;
            return { id, name };
          } catch (e) {
            console.error("getUserById error, id:", id, e);
            return { id, name: `User ${id}` };
          }
        }),
      );

      ownerMap = {
        ...ownerMap,
        ...Object.fromEntries(results.map((r) => [r.id, r.name])),
      };
    } finally {
      loadingOwners = false;
    }
  }

  $: if (items?.length) {
    loadOwners(items as any[]);
  }
</script>

<aside class="tt-side">
  {#if items.length === 0}
    <div class="tt-side__empty">No other TechTalks found.</div>
  {:else}
    {#each items as o (o.id)}
      <a
        class="tt-side__item {activeId === o.id ? 'is-active' : ''}"
        href={talkHref(o)}
        title={o.title}
        aria-current={activeId === o.id ? "page" : undefined}
      >
        <div class="tt-side__thumb">
          {#if o.thumbnailUrl || o.thumbnail_url}
            <img src={o.thumbnailUrl || o.thumbnail_url} alt={o.title} />
          {:else}
            <img src={defaultImage} alt={o.title} />
          {/if}
        </div>

        <div class="tt-side__info">
          <div class="tt-side__title">{o.title}</div>

          <div class="tt-side__meta">
            <span class="meta-item" title="Sahip">
              <Icon name="owner" width={14} height={14} />
              <span class="text">
                {#if ownerMap[getTalkUserId(o)]}
                  {ownerMap[getTalkUserId(o)]}
                {:else}
                  {loadingOwners ? "Loading..." : (o as any).owner ?? `User ${getTalkUserId(o)}`}
                {/if}
              </span>
            </span>

            {#if (o as any).date}
              <span class="meta-item" title="Tarih">
                <Icon name="clock" width={14} height={14} />
                <span class="text">{fmt((o as any).date) ?? (o as any).date}</span>
              </span>
            {/if}
          </div>
        </div>
      </a>
    {/each}
  {/if}
</aside>
