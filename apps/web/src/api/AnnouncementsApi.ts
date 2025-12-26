import instance from "@/axios/axiosInstance.ts";

export async function getAnnouncements() {
    // const response = await instance.get("/announcements");
    // return response.data;
    return [
        {
            "id": "1",
            "title": "Sistem Bakımı",
            "description": "23 Aralık 2025 tarihinde 01:00 - 03:00 saatleri arasında sistem bakımı yapılacaktır.",
            "createdTime": "2025-12-22T10:30:00Z",
            "isActive": true
        },
        {
            "id": "2",
            "title": "Yeni Özellik Yayında",
            "description": "Admin paneline duyuru yönetimi özelliği eklenmiştir.",
            "createdTime": "2025-12-20T14:15:00Z",
            "isActive": true
        },
        {
            "id": "3",
            "title": "Güncelleme Tamamlandı",
            "description": "Performans iyileştirmeleri ve hata düzeltmeleri başarıyla tamamlandı.",
            "createdTime": "2025-12-18T09:45:00Z",
            "isActive": false
        }
    ]
}