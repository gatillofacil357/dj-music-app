export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: string;
}

export const songs: Song[] = [
  {
    id: "1",
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    coverUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop",
    duration: "4:03"
  },
  {
    id: "2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a1a2a595f4fb?q=80&w=200&auto=format&fit=crop",
    duration: "3:20"
  },
  {
    id: "3",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop",
    duration: "3:23"
  },
  {
    id: "4",
    title: "Get Lucky",
    artist: "Daft Punk",
    album: "Random Access Memories",
    coverUrl: "https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?q=80&w=200&auto=format&fit=crop",
    duration: "4:08"
  },
  {
    id: "5",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    coverUrl: "https://images.unsplash.com/photo-1483032469466-b937c425697b?q=80&w=200&auto=format&fit=crop",
    duration: "2:54"
  },
  {
    id: "6",
    title: "Don't Start Now",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=200&auto=format&fit=crop",
    duration: "3:03"
  },
  {
    id: "7",
    title: "Starboy",
    artist: "The Weeknd",
    album: "Starboy",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop",
    duration: "3:50"
  },
  {
    id: "8",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop",
    duration: "2:47"
  }
];
