<script>
  import IconButton from "../UI/IconButton.svelte";
  import "./styles/Documents.scss";

  export let document;
</script>

<section class="document-detail-header">
  <div class="document-info">
    <h1>Document Title: {document.title}</h1>
    <p>Author: {document.author}</p>
    <p>Last Edited: {document.date}</p>
  </div>

  <div class="document-actions">
    <IconButton color="white" text="Download" buttonType="primary" />
    <IconButton text="Update" buttonType="secondary" />
  </div>
</section>
