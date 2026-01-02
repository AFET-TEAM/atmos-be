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

  let showConfirm = false;
  let userToDelete: any = null;

  async function load() {
    try {
      users = await getUsers();
      console.log(users, "users");

      console.log(
        "user_department values:",
        users.map((u) => ({
          id: u.id,
          user_department: u.user_department,
          type: typeof u.user_department,
        })),
      );

      userTeams = await getUsersTeams();
      departments = await getUsersDepartments();
      directorates = await getUsersDirectorates();
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  onMount(load);

  async function handleTeamChange(userId: number, teamId: string) {
    const user = users.find((u) => u.id === userId);
    const selectedTeam = userTeams.find((t) => t.id === Number(teamId));

    if (user && selectedTeam) {
      const updated = await updateUser(userId, {
        team: teamId,
        team_label: selectedTeam.name,
      });

      if (updated) {
        user.team = teamId;
        user.team_label = selectedTeam.name;
      }
    }
  }

  async function handleDepartmentChange(userId: number, deptId: string) {
    const user = users.find((u) => u.id === userId);
    const selectedDept = departments.find((d) => d.id === Number(deptId));

    if (user && selectedDept) {
      const updated = await updateUser(userId, {
        user_department: Number(deptId),
        department_label: selectedDept.name,
      });

      if (updated) {
        user.user_department = Number(deptId);
        user.department_label = selectedDept.name;
      }
    }
  }

  async function handleDirectorateChange(userId: number, dirId: string) {
    const user = users.find((u) => u.id === userId);
    const selectedDir = directorates.find((d) => d.id === Number(dirId));

    if (user && selectedDir) {
      const updated = await updateUser(userId, {
        directorate: Number(dirId),
        directorate_label: selectedDir.name,
      });

      if (updated) {
        user.directorate = Number(dirId);
        user.directorate_label = selectedDir.name;
      }
    }
  }

  async function handleRoleChange(userId: number, newRole: string) {
    const user = users.find((u) => u.id === userId);

    if (user) {
      const updated = await updateUser(userId, {
        role: newRole,
      });

      if (updated) {
        user.role = newRole;
      }
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
  <!-- <div class="header-row">
    <button class="btn btn-blue" on:click={openCreate}> + Add User </button>
  </div> -->

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
            value={String(user.team || "")}
            on:change={(e) =>
              handleTeamChange(user.id, (e.target as HTMLSelectElement).value)}
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
            value={String(user.userDepartment || "")}
            on:change={(e) =>
              handleDepartmentChange(
                user.id,
                (e.target as HTMLSelectElement).value,
              )}
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
            value={String(user.directorate || "")}
            on:change={(e) =>
              handleDirectorateChange(
                user.id,
                (e.target as HTMLSelectElement).value,
              )}
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
            value={user.role || ""}
            on:change={(e) =>
              handleRoleChange(user.id, (e.target as HTMLSelectElement).value)}
          >
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
          </select>
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
