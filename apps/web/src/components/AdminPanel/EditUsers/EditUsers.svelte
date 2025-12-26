<script lang="ts">
  import { onMount } from "svelte";
  import ConfirmModal from "../../UI/ConfirmModal.svelte";
  import "./EditUsers.scss";
  import {
    getUserByProfession,
    getUsers,
    getUsersTeams
  } from "@/api/UsersApi.ts";
  import DynamicCard from "@/components/UI/DynamicCard.svelte";

  let users: any[] = [];
  let userTeams: any[] = [];

  let showModal = false;
  let showConfirm = false;

  let userProfessions: any[] = [];

  async function load() {
    try {
      const usersResp = await getUsers();
      const teamsResp = await getUsersTeams();
      const professionsResp = await getUserByProfession();

      users = usersResp.data ?? [];
      userTeams = teamsResp.data ?? [];
      userProfessions = professionsResp ?? [];
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  onMount(load);

  function handleUpdate(user: any) {
  }

  function handleDelete(id: number) {
    showConfirm = true;
  }

  function doConfirmDelete() {
    showConfirm = false;
  }

  function cancelConfirm() {
    showConfirm = false;
  }

  function openCreate() {
    showModal = true;
  }
</script>

<section>
  <div class="header-row">
    <button class="btn btn-blue" on:click={openCreate}>
      + Add User
    </button>
  </div>

  {#if users.length}
    {#each users as user}
      <DynamicCard
              imgSrc={user.profilePicture}
              title={user.fullname}
              description={user.mailAddress}
              isAdmin={true}
              ownerIcon=""
              actions={[
          {
            label: "Update",
            onClick: () => handleUpdate(user),
            variant: "green",
            icon: "update",
            adminOnly: true
          },
          {
            label: "Delete",
            onClick: () => handleDelete(user.id),
            variant: "red",
            icon: "delete",
            adminOnly: true
          }
        ]}
      >
        <div class="user-dropdowns">
          <div class="dropdown-field">
            <span class="dropdown-title">Profession</span>
            <select bind:value={user.profession}>
              {#each userTeams as team}
                <option value={team.name}>
                  {team.name}
                </option>
              {/each}
            </select>
          </div>

          <div class="dropdown-field">
            <span class="dropdown-title">Team</span>
            <select bind:value={user.team}>
              {#each userProfessions as profession}
                <option value={profession.value}>
                  {profession.value}
                </option>
              {/each}
            </select>
          </div>
        </div>


      </DynamicCard>
    {/each}
  {:else}
    <p>Loading users...</p>
  {/if}

  <ConfirmModal
          open={showConfirm}
          title="Bu kullanıcıyı silmek istiyor musunuz?"
          message="Bu işlem geri döndürülemez"
          confirmText="Sil"
          cancelText="Vazgeç"
          on:confirm={doConfirmDelete}
          on:cancel={cancelConfirm}
          on:close={cancelConfirm}
  />
</section>

