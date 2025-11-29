 export function formatDate(dateString: string): string {
     const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

   export function getStatusText(status: string): string {
    switch (status) {
      case "Completed": return "Tamamlandı";
      case "In Progress": return "Devam Ediyor";
      case "Away": return "Beklemede";
      default: return "Bilinmiyor";
    }
  }

   export  function getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case "completed":
        return "completed";
      case "in progress":
        return "in-progress";
      case "away":
      case "pending":
        return "pending";
      case "upcoming":
        return "upcoming";
      default:
        return "";
    }
  }



  export function getIconForTab(tabType: string): string {
    switch (tabType.toLowerCase()) {
      case "tasks":
        return "📋";
      case "techtalks":
        return "🎤";
      case "documents":
        return "📄";
      case "reports":
        return "📊";
      case "aboutme":
        return "👤";
      default:
        return "📝";
    }
  }
