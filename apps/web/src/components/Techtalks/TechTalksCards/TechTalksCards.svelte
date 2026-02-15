<script lang="ts">
  import DynamicCard from "../../UI/DynamicCard.svelte";
  import type { TechTalk } from "../types/TechTalks";

  export let talk: TechTalk;
  export let isAdmin: boolean = false;
  export let onUpdate: (talk: TechTalk) => void;
  export let onDelete: (id: number) => void;

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
</script>

<DynamicCard
  imgSrc={talk.thumbnailUrl}
  title={talk.title}
  titleHref={talkHref(talk)}
  description={talk.description}
  ownerName={talk.owner}
  ownerIcon="owner"
  isAdmin={isAdmin}
  actions={[
    { label: "Update",   onClick: () => onUpdate(talk),   variant: "green", icon: "update", adminOnly: true },
    { label: "Delete",   onClick: () => onDelete(talk.id),variant: "red",   icon: "delete", adminOnly: true }
  ]}
/>
