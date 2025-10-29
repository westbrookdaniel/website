export type PostData = {
  page: {
    fileSlug: string;
  };
  data: {
    title: string;
    description: string;
    date: string;
    snippet?: string;
    tags?: string;
  };
  content: string;
};

export type Meta = {
  title: string;
};

export type RenderablePost = PostData & {
  formattedDate: string;
  readingTime: string;
  html: string;
};
