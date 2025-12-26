<script lang="ts">
    import {onMount} from "svelte";
    import DynamicCard from "@/components/UI/DynamicCard.svelte";
    import CreateAnnouncementModal from "@/components/AdminPanel/Announcements/CreateAnnouncementModal/CreateAnnouncementModal.svelte";
    import "./AddAnnouncements.scss";
    import {getAnnouncements} from "@/api/AnnouncementsApi.ts";

    let announcements: any[] = [];
    let selectedAnnouncement: any | null = null;
    let showModal = false;
    let saving = false;

    onMount(async () => {
        announcements = await getAnnouncements();
        console.log("Announcements loaded", announcements);
    });

    const handleUpdate = async (announcement: any) => {
        selectedAnnouncement = announcement;
        showModal = true;
    };

    const handleDelete = async (id: string) => {
    };

    function openCreate() {
        selectedAnnouncement = null;
        showModal = true;
    }

</script>

<section>
  <div class="header-row">
      <button class="btn btn-blue" on:click={openCreate}>
          + New Announcement
      </button>
  </div>
  {#each announcements as announcement}
    <DynamicCard
       title={announcement.title}
       description={announcement.description}
       isAdmin={true}
       ownerIcon=""
       actions={[
           {
               label: "Update",
               onClick: () => handleUpdate(announcement),
               variant: "green",
               icon: "update",
               adminOnly: true,
           },
           {
                label: "Delete",onClick: () => handleDelete(announcement.id),
                variant: "red",
                icon: "delete",
                adminOnly: true,
           },
       ]}
    />
  {/each}
    <CreateAnnouncementModal
        open={showModal}
        saving={saving}
        {selectedAnnouncement}
        on:close={() => { showModal = false; selectedAnnouncement = null; }}
    />
</section>
