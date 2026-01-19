<script>
  import { logoutUser } from "@/api/AuthApi";
  import IconButton from "../UI/IconButton.svelte";
  import "./LogoutButton.scss";

   export let className = "";

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      await logoutUser();
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/auth/login";
    }
  };
</script>

<IconButton
  text="Çıkış Yap"
  buttonType="secondary"
  iconName="logout"
  className={`logout-button ${className}`}
  on:click={handleLogout}
/>
