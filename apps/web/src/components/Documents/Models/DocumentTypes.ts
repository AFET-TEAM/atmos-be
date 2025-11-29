interface CommentsType {
    id: string;
    userId: string;
    comment: string;
    date : Date;
}

interface DocumentType {
    id: string;
    title: string;
    description: string;
    date: Date;
    author: string;
    likes: string;
    comments: CommentsType[];
}
