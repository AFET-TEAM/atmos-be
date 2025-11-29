<script lang="ts">
  import type { TechTalk } from "../types/TechTalks";
  import "./TechtalkDetails.scss";
  import TechTalkSideList from "../TechtalkSideList/TechtalkSideList.svelte";  
  import Icon from "../../UI/Icon.svelte";

  export let talk: TechTalk;
  export let others: TechTalk[] = [];

  const ytMatch = talk.videoUrl?.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  const youtubeId = ytMatch ? ytMatch[1] : null;
</script>


<div class="page">
  <section class="main">
    <div class="player">
      {#if youtubeId}
        <iframe
          class="player-iframe"
          src={`https://www.youtube.com/embed/${youtubeId}`}
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

    <h1 class="title">{talk.title}</h1>

    <div class="meta">
      <img class="avatar" src="/avatar-placeholder.png" alt="" />
      <div class="who">
        <div class="owner">{talk.owner}</div>
        <div class="date">{talk.date}  </div>
      </div>
      
    </div>

    <div class="comment-input">
      <input placeholder="Yorum yaz..." />
    </div>

    <div class="comments">
      <div class="comment">
        <img class="avatar" src="/avatar-placeholder.png" alt="" />
        <div class="c-body">
          <div class="c-head">
            <b>{talk.owner}</b>
            <span class="dot"></span>
            <span>21.01.2025</span>
          </div>
          <p>Lorem ipsum dolor sit amet…</p>
        </div>
      </div>
    </div>
  </section>

  <TechTalkSideList items={others} activeId={talk.id} />
</div>
