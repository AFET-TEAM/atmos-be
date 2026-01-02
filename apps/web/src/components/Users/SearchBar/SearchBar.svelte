<script lang="ts">
  import SearchInput from "@/components/UI/SearchInput.svelte";
  import { onMount } from "svelte";
  import type {
    getSortOptions,
    getUsersDepartments,
    getUsersDirectorates,
    getUsersTeams,
  } from "../../../api/UsersApi";
  import Dropdown from "../../UI/Dropdown.svelte";
  import "./search-bar.scss";

  let teams: Awaited<ReturnType<typeof getUsersTeams>> = [];
  let departments: Awaited<ReturnType<typeof getUsersDepartments>> = [];
  let directorates: Awaited<ReturnType<typeof getUsersDirectorates>> = [];
  let sortOptions: Awaited<ReturnType<typeof getSortOptions>> = [];

  let choosedTeam: string = "";
  let choosedDepartment: string = "";
  let choosedDirectorate: string = "";
  let filteredUsers: any[] = [];

  onMount(async () => {
    const {
      getSortOptions,
      getUsersDepartments,
      getUsersDirectorates,
      getUsersTeams,
    } = await import("../../../api/UsersApi");
    teams = await getUsersTeams();
    departments = await getUsersDepartments();
    directorates = await getUsersDirectorates();
    sortOptions = await getSortOptions();
  });

  const applyFilters = async () => {
    const { filterUsersByFields } = await import("../../../api/UsersApi");
    const filterCriteria: any = {
      team: choosedTeam || "",
      department: choosedDepartment || "",
      directorate: choosedDirectorate || "",
    };

    filteredUsers = await filterUsersByFields(filterCriteria);
    console.log("Filtrelenmiş kullanıcılar:", filteredUsers);
  };

  // ✅ Filtreleri sıfırla
  const resetFilters = () => {
    choosedTeam = "";
    choosedDepartment = "";
    choosedDirectorate = "";
    filteredUsers = [];
    console.log("Filtreler sıfırlandı");
  };

  const handleTeamChange = (value: string) => {
    if (value === "all") {
      choosedTeam = "";
    } else {
      choosedTeam = value;
    }
    console.log("Team seçildi:", value);
    applyFilters();
  };

  const handleDepartmentChange = (value: string) => {
    if (value === "all") {
      choosedDepartment = "";
    } else {
      choosedDepartment = value;
    }
    console.log("Department seçildi:", value);
    applyFilters();
  };

  const handleDirectorateChange = (value: string) => {
    if (value === "all") {
      choosedDirectorate = "";
    } else {
      choosedDirectorate = value;
    }
    console.log("Directorate seçildi:", value);
    applyFilters();
  };

  const handleSortChange = (value: string) => {
    console.log("Sort seçildi:", value);
  };
</script>

<section class="searchbar-container" id="searchbar">
  <button on:click={resetFilters} class="reset-btn">Sıfırla</button>

  <Dropdown
    options={teams}
    label="Choose Teams"
    id="team-filter"
    name="team"
    onChange={handleTeamChange}
  />
  <Dropdown
    options={departments}
    label="Choose Departments"
    id="department-filter"
    name="department"
    onChange={handleDepartmentChange}
  />
  <Dropdown
    options={directorates}
    label="Choose Directorates"
    id="directorate-filter"
    name="directorate"
    onChange={handleDirectorateChange}
  />
  <Dropdown
    options={sortOptions}
    label="Sort A/Z"
    id="sort-filter"
    name="sort"
    onChange={handleSortChange}
  />

  <SearchInput />
</section>

<style>
  .reset-btn {
    padding: 8px 16px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
  }

  .reset-btn:hover {
    background-color: #e0e0e0;
  }
</style>
