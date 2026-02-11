<script lang="ts">
  import { userAtom } from "@/stores/userStore";
  import type { Field } from "@/types/DocumentTypes/DocumentTypes";
  import { createEventDispatcher } from "svelte";
  import FormModal from "../../UI/FormModal.svelte";
  import type { TechTalk } from "../types/TechTalks";

  export let open = false;
  export let saving = false;
  export let talkToEdit: TechTalk | null = null;

  $: currentUser = $userAtom;

  const dispatch = createEventDispatcher<{
  close: void;
  submit: {
    id?: number;
    payload: {
      title: string;
      description: string;
      location: string;
      duration_min: number;
      video_url: string;
      thumbnail_url: string;
      teams_room_url: string;
      date: string;
      status: boolean;
    };
  };
}>();

function toTimestamptz(dateStr: string, timeStr: string) {
  const tz = "+03:00";
  let isoDate = dateStr.trim();
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(isoDate);
  if (m) {
    const [, dd, mm, yyyy] = m;
    isoDate = `${yyyy}-${mm}-${dd}`;
  }
  const t = (timeStr?.trim() || "00:00").slice(0, 5);
  return `${isoDate}T${t}:00${tz}`;
}
  type SubmitValues = Record<string, string | number | File | null>;

  $: modalTitle = talkToEdit ? "Update Tech Talk" : "Create New Tech Talk";
  $: submitLabel = talkToEdit ? "Update" : "Save";

  $: fields = [
    {
      key: "title",
      label: "Title",
      required: true,
      value: talkToEdit?.title ?? "",
      autoFocus: true,
    },
    {
      key: "description",
      label: "Description",
      required: true,
      value: talkToEdit?.description ?? "",
      type: "textarea",
      placeholder: "Short description...",
    },
    {
      key: "location",
      label: "Location",
      required: true,
      value: (talkToEdit as any)?.location ?? "",
      placeholder: "Online",
    },
    {
      key: "duration_min",
      label: "Duration (min)",
      required: true,
      value: (talkToEdit as any)?.duration_min ?? 0,
      type: "number",
      placeholder: "0",
    },
    {
      key: "date",
      label: "Date",
      required: true,
      value: (talkToEdit as any)?.date ?? "",
      type: "date",
    },
    {
      key: "time",
      label: "Time",
      required: false,
      value: (talkToEdit as any)?.time ?? "",
      type: "time",
    },
    {
      key: "thumbnail_url",
      label: "Thumbnail URL",
      required: false,
      value:
        (talkToEdit as any)?.thumbnail_url ??
        (talkToEdit as any)?.thumbnailUrl ??
        "",
      type: "url",
      placeholder: "https://...",
    },
    {
      key: "teams_room_url",
      label: "Teams URL",
      required: false,
      value:
        (talkToEdit as any)?.teams_room_url ??
        (talkToEdit as any)?.teamsRoomUrl ??
        "",
      type: "url",
      placeholder: "https://teams.microsoft.com/...",
    },
    {
      key: "video_url",
      label: "Video URL",
      required: false,
      value:
        (talkToEdit as any)?.video_url ??
        (talkToEdit as any)?.videoUrl ??
        "",
      type: "url",
      placeholder: "https://youtu.be/...",
    },
  ] satisfies Field[];
  function handleInnerSubmit(e: CustomEvent<SubmitValues>) {
  if (!currentUser?.id) {
    alert("TechTalk oluşturmak için giriş yapmalısınız.");
    return;
  }

  const v = e.detail;

  const dateStr = String(v.date ?? "");
  const timeStr = String(v.time ?? "");

  const payload = {
    title: String(v.title ?? ""),
    description: String(v.description ?? ""),
    location: String(v.location ?? ""),
    duration_min: Number(v.duration_min ?? 0),
    video_url: String(v.video_url ?? ""),
    thumbnail_url: String(v.thumbnail_url ?? ""),
    teams_room_url: String(v.teams_room_url ?? ""),
    date: toTimestamptz(dateStr, timeStr),
    status: true,
  };

  dispatch("submit", { id: talkToEdit?.id, payload });
}

</script>

<FormModal
  {open}
  {saving}
  title={modalTitle}
  {fields}
  {submitLabel}
  cancelLabel="Cancel"
  on:close={() => dispatch("close")}
  on:submit={handleInnerSubmit}
/>
