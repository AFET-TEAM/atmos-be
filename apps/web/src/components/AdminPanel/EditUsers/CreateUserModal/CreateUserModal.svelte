<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import FormModal from "../../../UI/FormModal.svelte";

  export let open = false;
  export let teams: any[] = [];
  export let departments: any[] = [];
  export let directorates: any[] = [];

  const dispatch = createEventDispatcher<{
    close: void;
    submit: {
      email: string;
      full_name: string;
      team?: string;
      user_department?: number;
      directorate?: number;
      address?: string;
      role?: string;
    };
  }>();

  type Field = {
    key: string;
    label: string;
    type?: "text" | "email" | "textarea" | "select";
    placeholder?: string;
    required?: boolean;
    value?: string | number;
    options?: Array<{ id: number | string; name: string }>;
  };

  type SubmitValues = Record<string, string | number>;

  const fields: Field[] = [
    {
      key: "email",
      label: "Email",
      type: "email",
      placeholder: "user@example.com",
      required: true,
    },
    {
      key: "full_name",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      required: true,
    },
    {
      key: "address",
      label: "Address",
      type: "text",
      placeholder: "Address",
    },
    {
      key: "team",
      label: "Team",
      type: "select",
      options: teams,
    },
    {
      key: "user_department",
      label: "Department",
      type: "select",
      options: departments,
    },
    {
      key: "directorate",
      label: "Directorate",
      type: "select",
      options: directorates,
    },
    {
      key: "role",
      label: "Role",
      type: "select",
      options: [
        { id: "user", name: "User" },
        { id: "admin", name: "Admin" },
        { id: "supervisor", name: "Supervisor" },
      ],
    },
  ];

  function handleInnerSubmit(e: CustomEvent<SubmitValues>) {
    const v = e.detail;
    dispatch("submit", {
      email: String(v.email ?? ""),
      full_name: String(v.full_name ?? ""),
      team: v.team ? String(v.team) : undefined,
      user_department: v.user_department
        ? Number(v.user_department)
        : undefined,
      directorate: v.directorate ? Number(v.directorate) : undefined,
      address: v.address ? String(v.address) : undefined,
      role: v.role ? String(v.role) : undefined,
    });
  }
</script>

<FormModal
  {open}
  title="Add New User"
  {fields}
  submitLabel="Create"
  cancelLabel="Cancel"
  on:close={() => dispatch("close")}
  on:submit={handleInnerSubmit}
/>
