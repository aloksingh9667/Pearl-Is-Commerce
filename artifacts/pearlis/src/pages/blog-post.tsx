import { useRoute } from "wouter";
import { useGetBlog } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:id");
  const blogId = parseInt(params?.id || "0");

  const { data: blog, isLoading } = useGetBlog(blogId, {
    query: { enabled: !!blogId }
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!blog) return <div className="min-h-screen flex items-center justify-center">Post not found</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-widest text-accent mb-4">
            {format(new Date(blog.createdAt), "MMMM d, yyyy")} • By {blog.author}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">{blog.title}</h1>
        </div>

        <div className="aspect-[21/9] bg-muted mb-16 overflow-hidden">
          <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-lg dark:prose-invert mx-auto font-serif">
          {blog.content.split('\n').map((paragraph, i) => (
            paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
