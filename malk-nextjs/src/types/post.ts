export interface Post {
  id: string;
  fields: {
    PostId?: string;
    FirebaseUID: string[];
    DisplayName?: string;
    PostCount?: number;
    Slug?: string;
    VideoTitle?: string;
    VideoURL: string;
    'Video ID'?: string;
    UserCaption: string;
    UserTags?: string[];
    Categories?: string[];
    UserLikes?: string[];
    LikeCount?: number;
    Playlists?: string[];
    PlaylistCount?: number;
    LikeFieldLastModified?: string;
    LastModified?: string;
    DateCreated?: string;
    DisplayDate?: string;
    ThumbnailURL?: string;
    'Post URL'?: string;
    [key: string]: any;
  };
} 