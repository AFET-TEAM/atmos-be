<script lang="ts">
  import type { TechTalk } from "../types/TechTalks";
  import DynamicCard from "../../UI/DynamicCard.svelte";

  export let talk: TechTalk;
  export let isAdmin: boolean = false;
  export let onDownload: (talk: TechTalk) => void;
  export let onUpdate: (talk: TechTalk) => void;
  export let onDelete: (id: number) => void;

</script>

<DynamicCard
  imgSrc={talk.thumbnailUrl}
  title={talk.title}
  titleHref={`/techtalks/${talk.id}`}
  description={talk.description}
  owner={talk.owner}
  ownerIcon="owner"
  isAdmin={isAdmin}
  actions={[
  //  { label: "Download", onClick: () => onDownload(talk), variant: "blue",  icon: "download" },
    { label: "Update",   onClick: () => onUpdate(talk),   variant: "green", icon: "update", adminOnly: true },
    { label: "Delete",   onClick: () => onDelete(talk.id),variant: "red",   icon: "delete", adminOnly: true }
  ]}
/>
