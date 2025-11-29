<script lang="ts">
import type { IconName } from "../../types/IconTypes/Icontypes"; 

  export let name: IconName;
  export let size: number = 14;
  export let width: number | string = size;
  export let height: number | string = size;

  const paths: Record<IconName, string> = {
    download: `
      <path d="M5.24984 6.41663V9.91663M5.24984 9.91663L6.4165 8.74996M5.24984 9.91663L4.08317 8.74996M12.8332 5.83329V8.74996C12.8332 11.6666 11.6665 12.8333 8.74984 12.8333H5.24984C2.33317 12.8333 1.1665 11.6666 1.1665 8.74996V5.24996C1.1665 2.33329 2.33317 1.16663 5.24984 1.16663H8.1665M12.8332 5.83329H10.4998C8.74984 5.83329 8.1665 5.24996 8.1665 3.49996V1.16663M12.8332 5.83329L8.1665 1.16663"
        stroke="currentColor" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    update: `
      <path d="M5.1725 8.46419C5.2775 8.63919 5.40583 8.80254 5.55167 8.94837C6.625 10.0217 8.36916 10.0217 9.44833 8.94837C9.88583 8.51087 10.1367 7.95668 10.2183 7.39084M4.78166 6.60919C4.86333 6.03753 5.11417 5.48917 5.55167 5.05167C6.625 3.97834 8.36916 3.97834 9.44833 5.05167C9.6 5.20334 9.72249 5.36668 9.82749 5.53585M5.06167 10.0217V8.46419H6.61916M9.93833 3.97836V5.53585H8.38084M13.3333 7.00002C13.3333 10.2217 10.7217 12.8334 7.5 12.8334C4.27834 12.8334 1.66666 10.2217 1.66666 7.00002C1.66666 3.77836 4.27834 1.16669 7.5 1.16669C10.7217 1.16669 13.3333 3.77836 13.3333 7.00002Z"
        stroke="currentColor" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    delete: `
      <path d="M12.25 3.48835C10.3075 3.29585 8.35333 3.19669 6.405 3.19669C5.25 3.19669 4.095 3.25502 2.94 3.37169L1.75 3.48835M4.95833 2.89919L5.08667 2.13502C5.18 1.58085 5.25 1.16669 6.23583 1.16669H7.76417C8.75 1.16669 8.82583 1.60419 8.91333 2.14085L9.04167 2.89919M10.9958 5.33169L10.6167 11.2059C10.5525 12.1217 10.5 12.8334 8.8725 12.8334H5.1275C3.5 12.8334 3.4475 12.1217 3.38333 11.2059L3.00417 5.33169M6.02583 9.62502H7.96833M5.54167 7.29169H8.45833"
        stroke="currentColor" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    owner: `
      <path d="M2.53748 5.62913V6.62079C2.53748 9.08246 4.53831 11.0833 6.99998 11.0833M6.99998 11.0833C9.46164 11.0833 11.4625 9.08246 11.4625 6.62079V5.62913M6.99998 11.0833V12.8333M6.18914 3.75079C6.71414 3.55829 7.28581 3.55829 7.81081 3.75079M6.53331 4.98746C6.84248 4.90579 7.16331 4.90579 7.47248 4.98746M6.99998 9.04163C8.28914 9.04163 9.33331 7.99746 9.33331 6.70829V3.49996C9.33331 2.21079 8.28914 1.16663 6.99998 1.16663C5.71081 1.16663 4.66664 2.21079 4.66664 3.49996V6.70829C4.66664 7.99746 5.71081 9.04163 6.99998 9.04163Z"
        stroke="currentColor" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    play: `
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="2"></circle>
      <path d="M10 8l7 4-7 4z" fill="currentColor"></path>
    `,
      date: `
      <path d="M7 2v3M17 2v3M3 9h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor" stroke-width="2" fill="none"/>
    `,
     completed: `
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 11.03a.75.75 0 0 0 1.06 0l4-4a.75.75 0 1 0-1.06-1.06L7.5 9.44 5.53 7.47a.75.75 0 0 0-1.06 1.06l2.5 2.5z"
        fill="currentColor"></path>
    `,
    ongoing: `
      <path d="M8 3.5a.5.5 0 0 1 .5.5v3.25H11a.5.5 0 0 1 0 1H8a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z" fill="currentColor"></path>
      <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8z" fill="currentColor"></path>
    `,
  };

  const viewBoxes: Record<IconName, string> = {
    download: '0 0 14 14',
    update:   '0 0 15 14',
    delete:   '0 0 14 14',
    owner:    '0 0 14 14',
    play:     '0 0 24 24', 
    date: "0 0 24 24",
    completed: "0 0 16 16",
    ongoing: "0 0 16 16",
  };
</script>

<svg
  {width}
  {height}
  viewBox={viewBoxes[name]}
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  style="color: inherit"
  aria-hidden="true"
>
  {@html paths[name] || ''}
</svg>
