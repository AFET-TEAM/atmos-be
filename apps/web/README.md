# ATOS Web Application

ATOS projesi için Astro + Svelte tabanlı web uygulaması.

## 🚀 Project Structure

```text
/
├── public/
│   ├── icons/
│   ├── img/
│   └── pdf/
├── src/
│   ├── api/            # API calls
│   ├── components/     # Astro & Svelte components
│   ├── layouts/        # Page layouts
│   ├── pages/          # Route pages
│   ├── stores/         # Global state management
│   ├── utils/          # Utility functions
│   └── styles/         # Global styles
└── package.json
```

## 👤 User Authentication & State Management

Bu projede user bilgilerine kolay erişim için global state management sistemi kullanılıyor.

### User Utils Kullanımı

#### Astro Component'lerde:

```astro
---
import { currentUser, checkAuth } from "@/utils/user";

const user = currentUser();
const isAuthenticated = checkAuth();
---

{isAuthenticated && (
  <h1>Merhaba {user?.full_name}!</h1>
  <p>Email: {user?.email}</p>
  <p>Departman: {user?.user_department}</p>
)}
```

#### Svelte Component'lerde:

```svelte
<script>
  import { user } from "@/utils/user";
</script>

{#if $user.isLoggedIn}
  <h1>Merhaba {$user.name}!</h1>
  <p>Departman: {$user.department}</p>
  <p>Rol: {$user.role}</p>
{/if}
```

#### JavaScript/TypeScript'te:

```javascript
import { currentUser, checkAuth } from "@/utils/user";

// User bilgisi al
const userData = currentUser();
console.log(userData?.full_name);

// Auth kontrolü
const isLoggedIn = checkAuth();
if (isLoggedIn) {
  // Authenticated user logic
}
```

### Available User Properties:

```typescript
interface User {
  id: number;
  email: string;
  full_name: string;
  user_department?: string;
  address?: string;
  role: string;
  profile_picture?: string;
  team?: string;
  profession?: string;
  created_at?: string;
}
```

### Available Utilities:

- `currentUser()` - Mevcut kullanıcı bilgilerini getirir
- `checkAuth()` - Kullanıcının giriş yapıp yapmadığını kontrol eder
- `$user.store` - Reactive user store (Svelte için)
- `$user.isLoggedIn` - Reactive login durumu
- `$user.name` - Reactive kullanıcı adı
- `$user.role` - Reactive kullanıcı rolü
- `$user.department` - Reactive kullanıcı departmanı

## 🔐 Role-Based Access Control (RBAC)

Bu projede merkezi bir permission/role yönetimi sistemi vardır. Her sayfada if koşulları yazmanız yerine modüler permission'lar kullanabilirsiniz.

### Mevcut Roller:

- **Admin**: Tüm işlemleri yapabilir
- **Supervisor**: İçerik yönetimi ve user kontrol işlemleri yapabilir
- **User**: Temel işlemleri yapabilir (content oluşturma vs)

### Permission'lar (src/utils/rbac.ts'de merkezi tanımlanır):

```typescript
PERMISSIONS = {
  VIEW_USERS, // Kullanıcıları görebilir
  CREATE_USER, // Yeni kullanıcı oluşturabilir
  EDIT_USER, // Kullanıcı düzenleyebilir
  DELETE_USER, // Kullanıcı silebilir
  CREATE_TECHTALK, // TechTalk oluşturabilir
  // ... ve daha fazlası
};
```

### Svelte Component'lerde RBAC:

#### 1. usePermissions Composable:

```svelte
<script>
  import { usePermissions } from "@/composables/usePermissions";
  const { can, canAny, isAdmin } = usePermissions();
</script>

{#if can("DELETE_USER")}
  <DeleteButton />
{/if}
```

#### 2. Protect Wrapper (Tavsiye Edilen - Modüler):

```svelte
<script>
  import Protect from "@/components/UI/Protect.svelte";
</script>

<!-- Yetkisiz kullanıcılara gizle (Default) -->
<Protect permission="DELETE_USER">
  <DeleteButton />  <!-- Yetkiniz yoksa görünmez -->
</Protect>

<!-- Fallback ile bilgi göster -->
<Protect permission="VIEW_ANALYTICS" fallback>
  <AnalyticsDashboard />
  <p slot="denied">Analitics görmek için supervisor olmalısınız</p>
</Protect>

<!-- Birden Fazla Permission (Herhangi Biri) -->
<Protect permissions={["EDIT_USER", "DELETE_USER"]}>
  <UserTools />
</Protect>

<!-- Birden Fazla Permission (Hepsi Gerekli) -->
<Protect permissions={["CREATE_USER", "EDIT_USER"]} requireAll>
  <AdvancedUserForm />
</Protect>

<!-- Rol Bazında -->
<Protect roles={["supervisor", "admin"]}>
  <SupervisorPanel />
</Protect>
```

### Astro Component'lerde RBAC:

#### 1. RoleGate Component (Permission bazında):

```astro
---
import RoleGate from "@/components/UI/RoleGate.astro";
---

<RoleGate permission="DELETE_USER" showFallback>
  <DeleteUserButton />

  <p slot="fallback">
    Bu işlemi yapmak için admin olmanız gerekir.
  </p>
</RoleGate>
```

#### 2. RoleGate Component (Role bazında):

```astro
---
import RoleGate from "@/components/UI/RoleGate.astro";
---

<RoleGate roles={["admin", "supervisor"]}>
  <AdminPanel />
</RoleGate>
```

#### 3. Direktly Kontrol Etme:

```astro
---
import { hasPermission } from "@/utils/rbac";
import { currentUser } from "@/utils/user";

const user = currentUser();
const canDelete = hasPermission(user?.role, "DELETE_USER");
---

{canDelete && <DeleteButton />}
```

#### 4. Sidebar Örneği:

```astro
---
import CustomLink from "@/components/UI/CustomLink.astro";
import RoleGate from "@/components/UI/RoleGate.astro";
---

<nav>
  <CustomLink href="/dashboard" text="Dashboard" />

  <!-- Sadece supervisor ve admin'e göster -->
  <RoleGate roles={["supervisor", "admin"]}>
    <CustomLink href="/approvals" text="Approvals" />
  </RoleGate>

  <!-- Sadece admin'e göster -->
  <RoleGate permission="MANAGE_ROLES">
    <CustomLink href="/settings" text="Settings" />
  </RoleGate>
</nav>
```

#### RoleGate Component:

```astro
---
import RoleGate from "@/components/UI/RoleGate.astro";
---

<RoleGate permission="DELETE_USER" showFallback>
  <DeleteButton />
</RoleGate>
```

#### Direktly Kontrol:

```astro
---
import { hasPermission } from "@/utils/rbac";
import { currentUser } from "@/utils/user";

const user = currentUser();
const canDelete = hasPermission(user?.role, "DELETE_USER");
---

{canDelete && <DeleteButton />}
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun run dev`             | Starts local dev server at `localhost:4321`      |
| `bun run build`           | Build your production site to `./dist/`          |
| `bun run preview`         | Preview your build locally, before deploying     |
| `bun run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun run astro -- --help` | Get help using the Astro CLI                     |

## 📝 API Integration

Bu proje ATOS Backend API'si ile entegre çalışır. API endpoint'leri:

- **Auth**: `/auth/login`, `/auth/register`, `/auth/me`
- **Users**: `/users`, `/users/count`, `/my/counts`
- **Content**: `/techtalks`, `/documents`, `/reports`, `/ideas`
- **Meetings**: `/meetings`
- **Comments & Likes**: `/comments`, `/likes`

## 🔧 Development Notes

- **State Management**: Nanostores kullanılıyor
- **Styling**: SCSS modules
- **Authentication**: JWT token based
- **API Client**: Axios interceptors ile
- **Components**: Astro + Svelte hybrid approach

## 👀 Want to learn more?

Feel free to check [Astro documentation](https://docs.astro.build) or [Svelte documentation](https://svelte.dev/docs).
