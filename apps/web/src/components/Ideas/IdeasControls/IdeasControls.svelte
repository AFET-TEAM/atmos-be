<script lang="ts">
  import "./IdeasControls.scss";
  export let sortOrder: 'az' | 'za' = 'az';
  export let searchTerm: string = '';
</script>

<div class="controls">
  <select class="sort-select" bind:value={sortOrder}>
    <option value="az">Sort A/Z</option>
    <option value="za">Sort Z/A</option>
  </select>

  <div class="search-wrapper">
    <div class="search-icon">
      <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.41663 12.1666C9.31612 12.1666 11.6666 9.81612 11.6666 6.91663C11.6666 4.01713 9.31612 1.66663 6.41663 1.66663C3.51713 1.66663 1.16663 4.01713 1.16663 6.91663C1.16663 9.81612 3.51713 12.1666 6.41663 12.1666Z" stroke="#505050" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11.0424 12.569C11.3516 13.5023 12.0574 13.5957 12.5999 12.779C13.0957 12.0323 12.7691 11.4198 11.8707 11.4198C11.2057 11.414 10.8324 11.9332 11.0424 12.569Z" stroke="#505050" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <input type="text" class="search-input" placeholder="Search" bind:value={searchTerm} />
  </div>
</div>
