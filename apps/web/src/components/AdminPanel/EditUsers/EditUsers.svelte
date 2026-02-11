<script lang="ts">
  import {
    deleteUser,
    getUsers,
    getUsersDepartments,
    getUsersDirectorates,
    getUsersTeams,
    updateUser,
  } from "@/api/UsersApi.ts";
  import DynamicCard from "@/components/UI/DynamicCard.svelte";
  import { onMount } from "svelte";
  import ConfirmModal from "../../UI/ConfirmModal.svelte";
  import "./EditUsers.scss";

  let users: any[] = [];
  let userTeams: any[] = [];
  let departments: any[] = [];
  let directorates: any[] = [];

  let drafts: Record<
    number,
    {
      team: string;
      user_department: string;
      directorate: string;
      role: string;
      dirty: boolean;
      saving: boolean;
    }
  > = {};

  let showConfirm = false;
  let userToDelete: any = null;

  async function load() {
    try {
      users = await getUsers();


      userTeams = await getUsersTeams();
      departments = await getUsersDepartments();
      directorates = await getUsersDirectorates();

      drafts = Object.fromEntries(
        users.map((u) => [
          u.id,
          {
            team: String(u.team ?? ""),
            user_department: String(u.user_department ?? ""),
            directorate: String(u.directorate ?? ""),
            role: String(u.role ?? ""),
            dirty: false,
            saving: false,
          },
        ]),
      );
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  onMount(load);

  function setDraft(
    userId: number,
    patch: Partial<{
      team: string;
      user_department: string;
      directorate: string;
      role: string;
    }>,
  ) {
    const current = drafts[userId];
    if (!current) return;

    drafts = {
      ...drafts,
      [userId]: {
        ...current,
        ...patch,
        dirty: true,
      },
    };
  }

  async function saveUser(userId: number) {
    const user = users.find((u) => u.id === userId);
    const d = drafts[userId];
    if (!user || !d) return;

    const selectedTeam = userTeams.find((t) => t.id === Number(d.team));
    const selectedDept = departments.find((x) => x.id === Number(d.user_department));
    const selectedDir = directorates.find((x) => x.id === Number(d.directorate));

    drafts = { ...drafts, [userId]: { ...d, saving: true } };

    try {
     const userDepartmentValue =
  d.user_department ? Number(d.user_department) : undefined;

const directorateValue =
  d.directorate ? Number(d.directorate) : undefined;

const updated = await updateUser(userId, {
  team: d.team || "",
  team_label: selectedTeam?.name ?? "",

  user_department: userDepartmentValue,
  department_label: selectedDept?.name ?? "",

  directorate: directorateValue,
  directorate_label: selectedDir?.name ?? "",

  role: d.role || "",
});

      if (updated) {
        user.team = d.team;
        user.team_label = selectedTeam?.name ?? "";

        user.user_department = d.user_department ? Number(d.user_department) : null;
        user.department_label = selectedDept?.name ?? "";

        user.directorate = d.directorate ? Number(d.directorate) : null;
        user.directorate_label = selectedDir?.name ?? "";

        user.role = d.role;

        drafts = {
          ...drafts,
          [userId]: { ...drafts[userId], dirty: false, saving: false },
        };
      } else {
        drafts = { ...drafts, [userId]: { ...drafts[userId], saving: false } };
      }
    } catch (e) {
      console.error("saveUser error:", e);
      drafts = { ...drafts, [userId]: { ...drafts[userId], saving: false } };
    }
  }

  function handleDelete(user: any) {
    userToDelete = user;
    showConfirm = true;
  }

  function doConfirmDelete() {
    if (userToDelete) {
      deleteUser(userToDelete.id).then((result) => {
        if (result) {
          users = users.filter((u) => u.id !== userToDelete.id);

          const next = { ...drafts };
          delete next[userToDelete.id];
          drafts = next;
        }
      });
    }
    showConfirm = false;
    userToDelete = null;
  }

  function cancelConfirm() {
    showConfirm = false;
    userToDelete = null;
  }
</script>

<section>
  {#if users.length}
    {#each users as user}
      <DynamicCard
        imgSrc={user?.profilePicture
          ? user.profilePicture
          : user.gender === "female"
            ? "/DefaultImageWoman.png"
            : "/DefaultImageMan.png"}
        title={user.fullName}
        description={user.email}
        isAdmin={true}
        actions={[
          {
            label: "Delete",
            onClick: () => handleDelete(user),
            variant: "red",
            icon: "delete",
            adminOnly: true,
          },
        ]}
      />

      <div class="user-dropdowns">
        <div class="dropdown-field">
          <span class="dropdown-title">Team</span>
          <select
            value={drafts[user.id]?.team ?? ""}
            on:change={(e) =>
              setDraft(user.id, { team: (e.target as HTMLSelectElement).value })}
          >
            <option value="">Select Team</option>
            {#each userTeams as team}
              <option value={String(team.id)}>{team.name}</option>
            {/each}
          </select>
        </div>

        <div class="dropdown-field">
          <span class="dropdown-title">Department</span>
          <select
            value={drafts[user.id]?.user_department ?? ""}
            on:change={(e) =>
              setDraft(user.id, {
                user_department: (e.target as HTMLSelectElement).value,
              })}
          >
            <option value="">Select Department</option>
            {#each departments as dept}
              <option value={String(dept.id)}>{dept.name}</option>
            {/each}
          </select>
        </div>

        <div class="dropdown-field">
          <span class="dropdown-title">Directorate</span>
          <select
            value={drafts[user.id]?.directorate ?? ""}
            on:change={(e) =>
              setDraft(user.id, {
                directorate: (e.target as HTMLSelectElement).value,
              })}
          >
            <option value="">Select Directorate</option>
            {#each directorates as dir}
              <option value={String(dir.id)}>{dir.name}</option>
            {/each}
          </select>
        </div>

        <div class="dropdown-field">
          <span class="dropdown-title">Role</span>
          <select
            value={drafts[user.id]?.role ?? ""}
            on:change={(e) =>
              setDraft(user.id, { role: (e.target as HTMLSelectElement).value })}
          >
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>

        <div class="dropdown-field save-field">
          <span class="dropdown-title">&nbsp;</span>
          <button
            type="button"
            class="btn btn-blue"
            disabled={!drafts[user.id]?.dirty || drafts[user.id]?.saving}
            on:click={() => saveUser(user.id)}
          >
            {drafts[user.id]?.saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    {/each}
  {:else}
    <p>Loading users...</p>
  {/if}

  <ConfirmModal
    open={showConfirm}
    title={`${userToDelete?.full_name} adlı kullanıcıyı silmek istiyor musunuz?`}
    message="Bu işlem geri döndürülemez"
    confirmText="Sil"
    cancelText="Vazgeç"
    on:confirm={doConfirmDelete}
    on:cancel={cancelConfirm}
    on:close={cancelConfirm}
  />
</section>
