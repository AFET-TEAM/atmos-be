<script lang="ts">
    import {writable} from "svelte/store";
    import "./calendar.scss";

    type CalendarCell = {
        date: number;
        isCurrentMonth: boolean;
        month: number;
        year: number;
        note: boolean;
    };

    const getDaysInMonth = (year: number, month: number) =>
        new Date(year, month + 1, 0).getDate();

    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const today = new Date();
    const selectedDate = writable<Date>(today);

    let displayMonth = today.getMonth();
    let displayYear = today.getFullYear();

    const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    let calendarDates: CalendarCell[] = [];

    const notes = writable<Record<string, string[]>>({});
    let notesValue: Record<string, string[]> = {};
    notes.subscribe(value => {
        notesValue = value;
    });

    let showPopup = false;
    let tempNote = "";

    $: selectedDate.subscribe(date => {
        displayMonth = date.getMonth();
        displayYear = date.getFullYear();
    });

    $: daysInMonth = getDaysInMonth(displayYear, displayMonth);
    $: firstDayIndex = getFirstDayOfMonth(displayYear, displayMonth);
    $: prevMonthDays = getDaysInMonth(displayYear, displayMonth - 1);

    $: {
        calendarDates = [];
        for (let i = firstDayIndex; i > 0; i--) {
            const prevMonth = displayMonth - 1 < 0 ? 11 : displayMonth - 1;
            const prevYear = displayMonth - 1 < 0 ? displayYear - 1 : displayYear;
            calendarDates.push({
                date: prevMonthDays - i + 1,
                isCurrentMonth: false,
                month: prevMonth,
                year: prevYear,
                note: Boolean(notesValue[`${prevYear}-${prevMonth}-${prevMonthDays - i + 1}`]?.length)
            });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDates.push({
                date: i,
                isCurrentMonth: true,
                month: displayMonth,
                year: displayYear,
                note: Boolean(notesValue[`${displayYear}-${displayMonth}-${i}`]?.length)
            });
        }
        const remainingCells = 42 - calendarDates.length;
        for (let i = 1; i <= remainingCells; i++) {
            const nextMonth = displayMonth + 1 > 11 ? 0 : displayMonth + 1;
            const nextYear = displayMonth + 1 > 11 ? displayYear + 1 : displayYear;
            calendarDates.push({
                date: i,
                isCurrentMonth: false,
                month: nextMonth,
                year: nextYear,
                note: Boolean(notesValue[`${nextYear}-${nextMonth}-${i}`]?.length)
            });
        }
    }

    function handleDateClick(cell: CalendarCell) {
        const dateObj = new Date(cell.year, cell.month, cell.date);
        selectedDate.set(dateObj);

        // if (cell.isCurrentMonth) {
        //     tempNote = "";
        //     showPopup = true;
        // }
    }

    function isSelected(cell: CalendarCell) {
        const sel = $selectedDate;
        return (
            sel.getDate() === cell.date &&
            sel.getMonth() === cell.month &&
            sel.getFullYear() === cell.year
        );
    }

    function getDateKey(date: Date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    function saveNote() {
        const key = getDateKey($selectedDate);
        if (!tempNote.trim()) return;

        notes.update(n => {
            if (!n[key]) n[key] = [];
            n[key].push(tempNote.trim());
            return {...n};
        });

        tempNote = "";
        showPopup = false;
    }

    function deleteNote(index: number) {
        const key = getDateKey($selectedDate);
        notes.update(n => {
            if (n[key]) {
                n[key].splice(index, 1);
                if (n[key].length === 0) delete n[key];
            }
            return {...n};
        });
    }

    function getNotesForSelectedDate() {
        const key = getDateKey($selectedDate);
        return notesValue[key] || [];
    }
</script>

<div class="calendar">
    {#each dayNames as day}
        <div class="day-label">{day}</div>
    {/each}

    {#each calendarDates as cell}
        <div
                role="button"
                tabindex="0"
                class="date-cell
            {cell.isCurrentMonth ? '' : 'other-month'}
            {isSelected(cell) ? 'selected' : ''}
            {cell.note ? 'note' : ''}"
                on:click={() => handleDateClick(cell)}
                on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleDateClick(cell)}
        >
            {cell.date}
            {#if cell.note}
                <span class="note-indicator"></span>
            {/if}
        </div>
    {/each}
</div>

{#if showPopup}
    <div class="popup-overlay">
        <div class="popup">
            <h3 class="popup-title">Not Ekle</h3>

            {#if getNotesForSelectedDate().length > 0}
                <div class="note-list">
                    {#each getNotesForSelectedDate() as note, index}
                        <div class="note-item">
                            <span>{note}</span>
                            <button class="delete-note" on:click={() => deleteNote(index)}>×</button>
                        </div>
                    {/each}
                </div>
            {/if}

            <div class="input-container">
                <input
                        type="text"
                        placeholder="Not giriniz"
                        bind:value={tempNote}
                        class="note-input"
                />
            </div>

            <div class="popup-buttons">
                <button class="btn-save" on:click={saveNote}>Kaydet</button>
                <button class="btn-close" on:click={() => (showPopup = false)}>Kapat</button>
            </div>
        </div>
    </div>
{/if}



