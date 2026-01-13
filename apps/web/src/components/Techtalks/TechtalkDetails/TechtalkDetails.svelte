<script lang="ts">
  import type { Comment } from "@/api/CommentsApi";
  import {
    createComment,
    deleteComment,
    fetchComments,
    updateComment,
  } from "@/api/CommentsApi";
  import { fetchLikes, toggleLike } from "@/api/LikesApi";
  import { getUserById } from "@/api/UsersApi";
  import { userAtom } from "@/stores/userStore";
  import { onMount } from "svelte";
  import Icon from "../../UI/Icon.svelte";
  import TechTalkSideList from "../TechtalkSideList/TechtalkSideList.svelte";
  import type { TechTalk } from "../types/TechTalks";
  import "./TechtalkDetails.scss";

  export let talk: TechTalk;
  export let others: TechTalk[] = [];

  let comments: Comment[] = [];
  let commentText = "";
  let sending = false;
  let likesCount = 0;
  let liking = false;
  let editingId: number | null = null;
  let hasLiked = false;
  let editingText = "";
  let loading = false;

  $: currentUser = $userAtom;
  $: isAdmin = currentUser?.role === "admin";

  const videoUrl = talk.video_url || talk.videoUrl;
  const thumbnailUrl = talk.thumbnail_url || talk.thumbnailUrl;

  const ytMatch = videoUrl?.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  const youtubeId = ytMatch ? ytMatch[1] : null;

  onMount(async () => {
    await loadCommentsAndLikes();
  });

  async function loadCommentsAndLikes() {
    loading = true;
    try {
      // Yorumları yükle
      const fetchedComments = await fetchComments("techtalk", talk.id);
      comments = fetchedComments;

      // Beğenileri yükle
      const likes = await fetchLikes("techtalk", talk.id);
      likesCount = likes.length;

      // Kullanıcı beğenmiş mi kontrol et
      if (currentUser) {
        hasLiked = likes.some((like) => like.user_id === currentUser.id);
      }
    } catch (error) {
      console.error("Yükleme hatası:", error);
    } finally {
      loading = false;
    }
  }

  async function submitComment() {
    const text = commentText.trim();
    if (!text || sending) return;
    if (!currentUser) {
      alert("Yorum yapmak için giriş yapmalısınız.");
      return;
    }

    sending = true;
    try {
      await createComment({
        target_type: "techtalk",
        target_id: talk.id,
        text: text,
      });

      await loadCommentsAndLikes();
      commentText = "";
    } catch (e) {
      console.error("Yorum gönderilemedi:", e);
      alert("Yorum gönderilemedi.");
    } finally {
      sending = false;
    }
  }

  function startEdit(comment: Comment) {
    editingId = comment.id;
    editingText = comment.text;
  }

  function cancelEdit() {
    editingId = null;
    editingText = "";
  }

  async function saveEdit(commentId: number) {
    const text = editingText.trim();
    if (!text || sending) return;

    sending = true;
    try {
      await updateComment(commentId, text);
      await loadCommentsAndLikes();
      editingId = null;
      editingText = "";
    } catch (e) {
      alert("Yorum güncellenemedi.");
    } finally {
      sending = false;
    }
  }

  async function handleDelete(commentId: number) {
    if (!confirm("Bu yorumu silmek istediğine emin misin?")) return;
    if (sending) return;

    sending = true;
    try {
      await deleteComment(commentId);
      await loadCommentsAndLikes();
    } catch (e) {
      console.error("Yorum silinemedi:", e);
      alert("Yorum silinemedi.");
    } finally {
      sending = false;
    }
  }

  async function handleLike() {
    if (liking) return;
    if (!currentUser) {
      alert("Beğenmek için giriş yapmalısın.");
      return;
    }

    liking = true;
    try {
      await toggleLike({
        target_type: "techtalk",
        target_id: talk.id,
      });

      await loadCommentsAndLikes();
    } catch (e) {
      console.error("Beğeni gönderilemedi:", e);
      alert("Beğeni gönderilemedi.");
    } finally {
      liking = false;
    }
  }

  function canEditDelete(comment: Comment): boolean {
    if (!currentUser) return false;
    return isAdmin || comment.user_id === currentUser.id;
  }
</script>

<div class="page">
  <section class="main">
    <div class="player">
      {#if youtubeId}
        <iframe
          class="player-iframe"
          src={`https://www.youtube.com/embed/${youtubeId}?playsinline=1`}
          title={talk.title}
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      {:else if thumbnailUrl}
        <div class="thumb-wrap">
          <img class="thumb" src={thumbnailUrl} alt={talk.title} />
          <div class="play-badge">
            <Icon name="play" width={78} height={78} />
          </div>
        </div>
      {:else}
        <div class="empty-player">Video/thumbnail bulunamadı</div>
      {/if}
    </div>

    <div class="titlebar">
      <h1 class="title">{talk.title}</h1>

      <div class="title-stats" aria-label="İstatistikler">
        <button
          type="button"
          class={`stat like-btn ${hasLiked ? "liked" : ""}`}
          on:click={handleLike}
          disabled={liking}
        >
          <Icon name="like" />
          <span>{likesCount}</span>
        </button>

        <div class="stat" title="Yorum sayısı">
          <Icon name="comment" />
          <span>{comments.length}</span>
        </div>
      </div>
    </div>

    <div class="meta">
      <img class="avatar" src="/avatar-placeholder.png" alt="" />
      <div class="owner">
        {#await getUserById(talk.userId || talk.user_id)}
          <div class="owner-name">Yükleniyor...</div>
        {:then user}
          <div class="owner-name">{user?.fullName || "Bilinmeyen"}</div>
        {/await}
        <div class="date-group">
          <span class="date-icon">
            <Icon name="clock" width={14} height={14} />
          </span>
          <span class="date">
            {talk.date && talk.date !== ""
              ? new Date(talk.date).toLocaleDateString("tr-TR")
              : "-"}
          </span>
        </div>
      </div>
    </div>

    <div class="comment-input">
      <span class="ci-icon" aria-hidden="true">
        <Icon name="pencil" width={14} height={14} />
      </span>

      <input
        placeholder="Yorum yaz..."
        bind:value={commentText}
        disabled={sending}
        on:keydown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitComment();
          }
        }}
      />

      <button
        class="send-btn"
        type="button"
        aria-label="Gönder"
        on:click={submitComment}
        disabled={sending || !commentText.trim()}
      >
        send
      </button>
    </div>

    <div class="comments">
      {#if loading}
        <div class="empty-player">Yorumlar yükleniyor...</div>
      {:else if comments.length > 0}
        {#each comments as c (c.id)}
          <div class="comment">
            <div class="comment-head">
              {#if editingId === c.id}
                <input class="comment-edit-input" bind:value={editingText} />
                <div class="comment-edit-actions">
                  <button type="button" on:click={() => saveEdit(c.id)}
                    >Kaydet</button
                  >
                  <button type="button" on:click={cancelEdit}>Vazgeç</button>
                </div>
              {:else}
                <p>{c.text}</p>
              {/if}
            </div>

            <div class="comment-info">
              <div class="comment-user">
                <Icon name="users" />
                {#await getUserById(c.user_id)}
                  <p>Yükleniyor...</p>
                {:then user}
                  <p>{user?.fullName || "Bilinmeyen"}</p>
                {/await}
              </div>

              <div class="comment-date">
                <Icon name="clock" />
                <span>{new Date(c.created_at).toLocaleDateString("tr-TR")}</span
                >
              </div>

              {#if canEditDelete(c)}
                <div class="comment-actions">
                  <button
                    type="button"
                    class="icon-btn edit-btn"
                    on:click={() => startEdit(c)}
                  >
                    <Icon name="pencil" width={14} height={14} />
                  </button>
                  <button
                    type="button"
                    class="icon-btn delete-btn"
                    on:click={() => handleDelete(c.id)}
                  >
                    <Icon name="delete" width={14} height={14} />
                  </button>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      {:else}
        <div class="empty-player">Henüz yorum yok</div>
      {/if}
    </div>
  </section>

  <TechTalkSideList items={others} activeId={Number(talk.id)} />
</div>
