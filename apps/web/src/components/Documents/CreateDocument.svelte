<script>
  import "./styles/Documents.scss";

  let editorElement;
  let activeFormats = {
    bold: false,
    italic: false,
    underline: false,
    thin: false,
  };

  $: characterCount = editorElement ? editorElement.innerText.length : 0;

  function applyFormat(command, value = null) {
    document.execCommand(command, false, value);
    editorElement.focus();
    updateActiveFormats();
  }

  function updateActiveFormats() {
    activeFormats.bold = document.queryCommandState("bold");
    activeFormats.italic = document.queryCommandState("italic");
    activeFormats.underline = document.queryCommandState("underline");
  }

  function handleBold() {
    applyFormat("bold");
  }

  function handleItalic() {
    applyFormat("italic");
  }

  function handleUnderline() {
    applyFormat("underline");
  }

  function handleThin() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontWeight = "300";
      try {
        range.surroundContents(span);
      } catch (e) {
      }
    }
    editorElement.focus();
  }

  function handleAddImage() {
    const imageUrl = prompt("Enter image URL:");
    if (imageUrl) {
      applyFormat("insertImage", imageUrl);
    }
  }

  function handleCreateLink() {
    const url = prompt("Enter URL:");
    if (url) {
      applyFormat("createLink", url);
    }
  }

  function handleUploadFile() {
  }

  function handleSaveDraft() {
  }

  function handlePublish() {
  }

  function handleInput() {
    updateActiveFormats();
  }

  function handleKeyUp() {
    updateActiveFormats();
  }

  function handleMouseUp() {
    updateActiveFormats();
  }

  const toolbarActions = [
    {
      group: "format",
      items: [
        { label: "B", click: handleBold, class: "bold", title: "Bold" },
        { label: "I", click: handleItalic, class: "italic", title: "Italic" },
        {
          label: "U",
          click: handleUnderline,
          class: "underline",
          title: "Underline",
        },
        { label: "T", click: handleThin, class: "thin", title: "Thin" },
      ],
    },
    {
      group: "insert",
      items: [
        { label: "🖼️", click: handleAddImage, title: "Add Image" },
        { label: "🔗", click: handleCreateLink, title: "Create Link" },
        { label: "📎", click: handleUploadFile, title: "Upload File" },
      ],
    },
  ];
</script>

<section class="create-document-container">
  <div class="document-header">
    <h1>Create Document</h1>
    <div class="save-actions">
      <button on:click={handleSaveDraft}>Save Draft</button>
      <button on:click={handlePublish}>Publish Document</button>
    </div>
  </div>

  <div class="editor-toolbar">
    {#each toolbarActions as group}
      <div class="toolbar-group">
        {#each group.items as action}
          <button
            on:click={action.click}
            class:active={action.class && activeFormats[action.class]}
            class={action.class || ""}
            title={action.title}
          >
            {action.label}
          </button>
        {/each}
      </div>
    {/each}
  </div>

  <div class="document-editor">
    <div
      class="editor-content"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      tabindex="0"
      bind:this={editorElement}
      on:input={handleInput}
      on:keyup={handleKeyUp}
      on:mouseup={handleMouseUp}
      data-placeholder="Start writing your document here... Use formatting buttons above."
    ></div>
  </div>
</section>
