<script lang="ts">
  import type { Comment } from "@/api/CommentsApi";
  import {
    createComment,
    deleteComment,
    fetchComments,
    updateComment,
  } from "@/api/CommentsApi";
  import { fetchLikes, toggleLike } from "@/api/LikesApi";
  import { getUserById } from '@/api/UsersApi';
  import { userAtom } from "@/stores/userStore";
  import moment from "moment";
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
  let currentTalkId: number | null = null;

  $: currentUser = $userAtom;
  $: isAdmin = currentUser?.role === "admin";

  $: if (talk?.id && talk.id !== currentTalkId) {
    currentTalkId = talk.id;

    hasLiked = false;
    likesCount = 0;
    comments = [];
    commentText = "";

    loadCommentsAndLikes(talk.id);
  }

  const videoUrl = talk.video_url || talk.videoUrl;
  const thumbnailUrl = talk.thumbnail_url || talk.thumbnailUrl;

  const ytMatch = videoUrl?.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  const youtubeId = ytMatch ? ytMatch[1] : null;

  async function loadCommentsAndLikes(talkId: number) {
    loading = true;
    try {
      const fetchedComments = await fetchComments("techtalk", talkId);
      comments = fetchedComments;

      const likes = await fetchLikes("techtalk", talkId);
      likesCount = likes.length;

      if (currentUser) {
        hasLiked = (likes as Array<{ user_id?: number | string; userId?: number | string }>).some(
          (like) => Number(like.user_id ?? like.userId) === Number(currentUser.id)
        );
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

      await loadCommentsAndLikes(talk.id);
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
      await loadCommentsAndLikes(talk.id);
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
      await loadCommentsAndLikes(talk.id);
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

      await loadCommentsAndLikes(talk.id);
    } catch (e) {
      console.error("Beğeni gönderilemedi:", e);
      alert("Beğeni gönderilemedi.");
    } finally {
      liking = false;
    }
  }
  function canEditDelete(comment: any): boolean {
  if (!currentUser) return false;

  const commentUserId = Number(comment.user_id ?? comment.userId);
  const currentUserId = Number(currentUser.id);

  return Boolean(isAdmin) || (commentUserId > 0 && commentUserId === currentUserId);
}
const getCreatedAt = (c: Comment | any) => (c as any).createdAt ?? (c as any).created_at;
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

        <div class="stat" title="Comment count">
          <Icon name="comment" />
          <span>{comments.length}</span>
        </div>
      </div>
    </div>

    <div class="meta">
      {#await getUserById(talk.userId || talk.user_id)}
        <img class="avatar sidebar-logo" src="/img/logo.png" alt="Logo" />
        <div class="owner">
          <div class="owner-name">Loading...</div>
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
      {:then user}
        {#if user?.profilePicture}
          <img class="avatar" src={user.profilePicture} alt={user?.fullName || ""} />
        {:else}
          <img class="avatar logo" src="/img/logo.png" alt="Logo" />
        {/if}

        <div class="owner">
          <div class="owner-name">{user?.fullName || "Bilinmeyen"}</div>

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
      {/await}
    </div>

    <div class="comment-input">
      <span class="ci-icon" aria-hidden="true">
        <Icon name="pencil" width={14} height={14} />
      </span>

      <input
        placeholder="Write a comment..."
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
        <div class="empty-player">Loading comments...</div>
      {:else if comments.length > 0}
        {#each comments as c (c.id)}
          <div class="comment">
            <div class="comment-head">
              {#if editingId === c.id}
                <input class="comment-edit-input" bind:value={editingText} />
                <div class="comment-edit-actions">
                  <button type="button" on:click={() => saveEdit(c.id)}
                    >Submit</button
                  >
                  <button type="button" on:click={cancelEdit}>Cancel</button>
                </div>
              {:else}
                <p>{c.text}</p>
              {/if}
            </div>

            <div class="comment-info">
              <div class="comment-user">
                <Icon name="users" />
                <p>{c.userName || c.user_name || `User ${c.user_id}`}</p>
              </div>
              <div class="comment-date">
                <Icon name="clock" />
                <span>
                  {getCreatedAt(c) ? moment(getCreatedAt(c)).format("DD MMM YYYY, HH:mm") : ""}
                </span>
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
        <div class="empty-player">No comments yet</div>
      {/if}
    </div>
  </section>

  <TechTalkSideList items={others} activeId={Number(talk.id)} />
</div>
