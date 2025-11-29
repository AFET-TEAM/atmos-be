<script lang="ts">
  import SvelteIcon from "./SvelteIcon.svelte";
  import { createEventDispatcher } from 'svelte';
  
  export let placeholder: string = "Ara...";
  export let value: string = "";
  export let width: string = "100%";
  export let disabled: boolean = false;
  export let data: any[] = [];
  export let searchFields: string[] = ['title', 'description'];
  export let minLength: number = 1;
  
  const dispatch = createEventDispatcher();
  
  let filteredData: any[] = data;
  let isFocused: boolean = false;
  
  $: {
    if (value.length >= minLength) {
      filteredData = filterData(data, value);
      dispatch('search', { 
        query: value, 
        results: filteredData,
        hasResults: filteredData.length > 0
      });
    } else {
      filteredData = data;
      dispatch('search', { 
        query: value, 
        results: data,
        hasResults: true
      });
    }
  }
  
  function filterData(items: any[], query: string): any[] {
    if (!query || query.length < minLength) return items;
    
    const lowercaseQuery = query.toLowerCase();
    
    return items.filter(item => {
      return searchFields.some(field => {
        const fieldValue = getNestedValue(item, field);
        return fieldValue && 
               String(fieldValue).toLowerCase().includes(lowercaseQuery);
      });
    });
  }
  
  function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
  
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
  }
  
  function handleFocus() {
    isFocused = true;
    dispatch('focus');
  }
  
  function handleBlur() {
    isFocused = false;
    dispatch('blur');
  }
  
 
</script>

<div class="search-container" style="width: {width}">
  <div class="search-icon">
    <SvelteIcon name="search" width={16} height={16} />
  </div>
  <input
    class="search-input"
    class:focused={isFocused}
    type="text"
    {placeholder}
    {value}
    {disabled}
    on:input={handleInput}
    on:focus={handleFocus}
    on:blur={handleBlur}
  />

</div>




