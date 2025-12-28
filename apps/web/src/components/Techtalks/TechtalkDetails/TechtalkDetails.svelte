<script lang="ts">
  import type { CurrentUser, TechTalk, TechTalkComment } from "../types/TechTalks";
  import "./TechtalkDetails.scss";
  import TechTalkSideList from "../TechtalkSideList/TechtalkSideList.svelte";  
  import Icon from "../../UI/Icon.svelte";
  import {
    addCommentWithMe,
    updateTechTalkComment,
    deleteTechTalkComment,
    addTechTalkLike,
  } from "@/api/TechTalksApi";
  import { fetchCurrentUser } from "@/api/IdeasApi";
  import { onMount } from "svelte";

  export let talk: TechTalk;
  export let others: TechTalk[] = [];

  let comments: TechTalkComment[] = [...(talk?.comments ?? [])];
  let commentText = "";
  let sending = false;
  let likes = Number(talk?.likes ?? 0);
  let liking = false;
  let currentUser: CurrentUser | null = null;
  let editingId: number | null = null;
  let hasLiked = false;
  let editingText = "";

  const ytMatch = talk.videoUrl?.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  const youtubeId = ytMatch ? ytMatch[1] : null;

  onMount(async () => {
    currentUser = await fetchCurrentUser();

    if (currentUser && talk.likedUserIds) {
      hasLiked = talk.likedUserIds.includes(Number(currentUser.id));
    }
  });

  async function submitComment() {
    const text = commentText.trim();
    if (!text || sending) return;
    sending = true;
    try {
      const updatedTalk = await addCommentWithMe(String(talk.id), text);
      comments = updatedTalk.comments ?? [];
      commentText = "";
    } catch (e) {
      console.error("Yorum gönderilemedi:", e);
      alert("Yorum gönderilemedi.");
    } finally {
      sending = false;
    }
  }

  function startEdit(comment: TechTalkComment) {
    editingId = comment.id;
    editingText = comment.comment;
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
      const updatedTalk = await updateTechTalkComment(String(talk.id), commentId, {
        comment: text,
        date: new Date().toISOString().slice(0, 10),
      });
      comments = updatedTalk.comments ?? [];
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
      const updatedTalk = await deleteTechTalkComment(String(talk.id), commentId);
      comments = updatedTalk.comments ?? [];
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
      const updatedTalk = await addTechTalkLike(String(talk.id));
      likes = Number(updatedTalk.likes ?? likes);

      if (updatedTalk.likedUserIds) {
        hasLiked = updatedTalk.likedUserIds.includes(
          Number(currentUser.id)
        );
      }
    } catch (e) {
      console.error("Beğeni gönderilemedi:", e);
      alert("Beğeni gönderilemedi.");
    } finally {
      liking = false;
    }
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
      {:else if talk.thumbnailUrl}
        <div class="thumb-wrap">
          <img class="thumb" src={talk.thumbnailUrl} alt={talk.title} />
          <div class="play-badge">
            <Icon name="play" width={78} height={78}/>
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
          <span>{likes}</span>
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
          <div class="owner-name">{talk.owner}</div>
          <div class="date-group">
            <span class="date-icon" > <Icon name="clock" width={14} height={14} /> </span>
            <span class="date" > {talk.date} </span>   
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
    {#if comments.length > 0}
      {#each comments as c (c.id)}
        <div class="comment">
          <div class="comment-head">
            {#if editingId === c.id}
              <input
                class="comment-edit-input"
                bind:value={editingText}
              />
              <div class="comment-edit-actions">
                <button type="button" on:click={() => saveEdit(c.id)}>Kaydet</button>
                <button type="button" on:click={cancelEdit}>Vazgeç</button>
              </div>
            {:else}
              <p>{c.comment}</p>
            {/if}
          </div>
        
          <div class="comment-info">
            <div class="comment-user">
              <Icon name="users" />
              <p>{c.userName}</p>
            </div>
          
            <div class="comment-date">
              <Icon name="clock" />
              <span>{c.date}</span>
            </div>
          
            {#if currentUser && Number(currentUser.id) === c.userId}
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
