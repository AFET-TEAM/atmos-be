<script lang="ts">
  import "./ui.scss";

  export let options: Array<{
    name: string;
    id?: number;
    team?: string;
  }> = [];
  export let label: string = "";
  export let id: string = "";
  export let name: string = "";
  export let onChange: ((value: string) => void) | null = null;

  let selectedValue: string = "";

  function handleChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    selectedValue = selectElement.value;
    if (onChange) {
      onChange(selectElement.value);
    }
  }
</script>

<label>
  <div class="dropdown-wrapper">
    <div class="dropdown-icon">
      <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
        <path
          d="M1 2.5L3.5 5L6 2.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <select
      {id}
      {name}
      class="dropdown"
      bind:value={selectedValue}
      on:change={handleChange}
    >
      <option value="" disabled selected>{label}</option>
      {#each options as option (option.id || option.team)}
        {@const displayName = option.name || option.team || ""}
        {@const optionValue =
          option.id !== undefined ? String(option.id) : option.team || ""}
        <option value={optionValue}>
          {displayName}
        </option>
      {/each}
    </select>
  </div>
</label>
