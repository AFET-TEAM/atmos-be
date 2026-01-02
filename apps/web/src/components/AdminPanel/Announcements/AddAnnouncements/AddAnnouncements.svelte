<script lang="ts">
  import {
    createAnnouncement,
    deleteAnnouncement,
    getAnnouncements,
    updateAnnouncement,
  } from "@/api/AnnouncementsApi.ts";
  import CreateAnnouncementModal from "@/components/AdminPanel/Announcements/CreateAnnouncementModal/CreateAnnouncementModal.svelte";
  import DynamicCard from "@/components/UI/DynamicCard.svelte";
  import type { User } from "@/stores/userStore";
  import { onMount } from "svelte";
  import "./AddAnnouncements.scss";

  let currentUser: User | null = null;

  let announcements: any[] = [];
  let selectedAnnouncement: any | null = null;
  let showModal = false;
  let saving = false;

  function getUserFromCookie(): User | null {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "user") {
        try {
          return JSON.parse(decodeURIComponent(value));
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  onMount(async () => {
    currentUser = getUserFromCookie();

    announcements = await getAnnouncements();
  });

  const handleUpdate = async (announcement: any) => {
    selectedAnnouncement = announcement;
    showModal = true;
  };

  const handleDelete = async (id: string) => {
    if (confirm("Emin misiniz?")) {
      try {
        await deleteAnnouncement(Number(id));
        announcements = await getAnnouncements();
      } catch (error) {
        console.error("Failed to delete announcement:", error);
      }
    }
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
      description={announcement.content}
      isAdmin={true}
      actions={[
        {
          label: "Update",
          onClick: () => handleUpdate(announcement),
          variant: "green",
          icon: "update",
          adminOnly: true,
        },
        {
          label: "Delete",
          onClick: () => handleDelete(announcement.id),
          variant: "red",
          icon: "delete",
          adminOnly: true,
        },
      ]}
    />
  {/each}
  <CreateAnnouncementModal
    open={showModal}
    {saving}
    {selectedAnnouncement}
    on:close={() => {
      showModal = false;
      selectedAnnouncement = null;
    }}
    on:submit={async (e) => {
      console.log("Submitting announcement:", e.detail);
      saving = true;
      try {
        const { id, payload } = e.detail;

        if (id) {
          await updateAnnouncement(id, {
            title: payload.title,
            content: payload.content,
          });
        } else {
          await createAnnouncement({
            title: payload.title,
            content: payload.content,
          });
        }

        announcements = await getAnnouncements();
        showModal = false;
        selectedAnnouncement = null;
      } catch (error) {
        console.error("Failed to save announcement:", error);
      } finally {
        saving = false;
      }
    }}
  />
</section>
