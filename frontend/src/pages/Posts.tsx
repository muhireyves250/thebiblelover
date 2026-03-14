import BlogGrid from '../components/BlogGrid';
import SEO from '../components/SEO';

const Posts: React.FC = () => {
  return (
    <>
      <SEO 
        title="Journal" 
        description="Explore our latest articles, reflections, and teachings on faith and the Holy Scriptures."
      />
      <BlogGrid />
    </>
  );
};

export default Posts;


