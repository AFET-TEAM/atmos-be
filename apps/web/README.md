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
