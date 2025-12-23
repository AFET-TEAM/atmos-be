<script>
  import { logoutUser } from "@/api/AuthApi";
  import IconButton from "../UI/IconButton.svelte";

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
  className="customLink"
  color="blue"
  border={true}
  on:click={handleLogout}
/>
