# Componentlerin Kullanımı

- Bu doküman proje içerisinde oluşturulan componentlerin kullanımını göstemek amacıyla yazılmıştır.
- Dev arkadaşların yazmış olduğu componentleri eklemesi rica olunur.
***

### Tab Componenti
```svelte

<script>
  import TabMenu from "./TabMenu.svelte";
import Aboutme from "@/components/Users/TabComponents/Aboutme.svelte";
import Documents from "@/components/Users/TabComponents/Documents.svelte";
import Reports from "@/components/Users/TabComponents/Reports.svelte";
import Tasks from "@/components/Users/TabComponents/Tasks.svelte";
import TechTalks from "@/components/Users/TabComponents/TechTalks.svelte";
// Tableri bu şekilde bir array içine alarak component - name ve value değerlerini geçmeliyiz.
let tabs = [
  { name: "Aboutme", component: Aboutme, value: 1 },
  { name: "Tasks", component: Tasks, value: 2 },
  { name: "TechTalks", component: TechTalks, value: 3 },
  { name: "Documents", component: Documents, value: 4 },
  { name: "Reports", component: Reports, value: 5 },
];
</script>
<TabMenu  tabs={tabs} />

```

### Custom Link Componenti

```svelte
 <CustomLink text="Ideas" href="/ideas" iconName="lamp" />
```

### Icon.astro ve SvelteIcon.svelte
- Astro dosyaları içine icon eklemesi yaparken Icon.astro componentini svelte içine ekleme yaparken SvelteIcon.svelte componentini kullanmamamız gerekmektedir. İki componentinde aldığı props değerleri aynıdır.

- Figma üzerinden almış olduğunz svg path'ini kullanacağız component içindeki objeye eklemeniz gerekiyor.

```svelte
 <Icon name="users" width={10} height={10}/>
 <SvelteIcon name="users" width={10} height={10} color="#xxx" />
```

### User Avatar
- UserAvatar.astro componenti kendi içinde image size alabilir

```svelte

 <UserAvatar imageSize="user-image-md" user={team} />
 user-image-sm - user-image-md - user-image-lg

 ```