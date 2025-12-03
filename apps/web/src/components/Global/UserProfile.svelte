<script>
  import { $user, $userName, $isLoggedIn, logout, updateUser } from '@/stores/userStore';
  
  // Reactive - otomatik güncellenir
  $: user = $user;
  $: userName = $userName;
  $: isLoggedIn = $isLoggedIn;
  
  async function handleLogout() {
    await logout();
    window.location.href = '/auth/login';
  }
  
  async function updateProfile() {
    try {
      await updateUser({ 
        full_name: 'Updated Name',
        user_department: 'New Department' 
      });
      alert('Profile updated!');
    } catch (error) {
      console.error('Update failed:', error);
    }
  }
</script>

<div class="user-profile">
  {#if $isLoggedIn}
    <div class="user-avatar">
      <img src={$user?.profile_picture || '/default-avatar.png'} alt="Avatar" />
      <h3>{$userName}</h3>
    </div>
    
    <div class="user-details">
      <p><strong>Email:</strong> {$user?.email}</p>
      <p><strong>Department:</strong> {$user?.user_department || 'N/A'}</p>
      <p><strong>Role:</strong> {$user?.role}</p>
    </div>
    
    <div class="actions">
      <button on:click={updateProfile}>Update Profile</button>
      <button on:click={handleLogout}>Logout</button>
    </div>
  {:else}
    <p>Please log in to view profile</p>
  {/if}
</div>

<style>
  .user-profile {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .user-avatar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .user-avatar img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    background: #3b82f6;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  button:hover {
    background: #2563eb;
  }
</style>