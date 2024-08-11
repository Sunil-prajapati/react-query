import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPost, fetchPosts, fetchTags } from "../api/api";
import { useState } from "react";
const PostList = () => {
  const [page, setPage] = useState(1);
  const {
    data: postData,
    isError,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts", { page }],
    queryFn: () => fetchPosts(page),
    staleTime: 1000 * 60 * 5,
  });

  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
    staleTime: Infinity,
    // gcTime: 0,
    // refetchInterval:1000 * 5
  });

  const queryClient = useQueryClient();

  const {
    mutate,
    isError: isPostError,
    isPending,
    error: postError,
    reset,
  } = useMutation({
    mutationFn: addPost,
    onMutate: () => {
      return { id: 1 };
    },
    onSuccess: (data, variable, context) => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
        exact: true,
        predicate: (query) =>
          query.queryKey[0] === "posts" && query.queryKey[1].page >= 2,
      });
    },
    // onError: (error, variable, context) => {
    //   console.log(error);
    // },
    // onSettled: (data, error, variable, context) => {},
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const tags = Array.from(formData.keys()).filter((key) => formData.get(key));

    if (!title || !tags) return;
    mutate({ id: postData?.data?.length + 1, title, tags });
    e.target.reset();
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your post.."
          name="title"
          className="postbox"
        />
        <div className="tags">
          {tagsData?.map((tag) => {
            return (
              <div key={tag}>
                <input type="checkbox" name={tag} value={tag} id={tag} />
                <label htmlFor={tag}>{tag}</label>
              </div>
            );
          })}
        </div>
        <button>Add Post</button>

        {isPending && <p>Loading...</p>}
        {isPostError && <p onClick={reset}>{postError?.message}</p>}
        <div className="pages">
          <button
            disabled={!postData?.prev}
            onClick={() => setPage((oldPage) => Math.max(oldPage - 1, 0))}
          >
            Previous page
          </button>
          <span>{page}</span>
          <button
            onClick={() => setPage((oldPage) => Math.max(oldPage + 1))}
            disabled={!postData?.next}
          >
            Next page
          </button>
        </div>
      </form>
      {isLoading && <p>Loading...</p>}
      {isError && <p>{error?.message}</p>}
      {postData?.data?.map((post) => {
        return (
          <div key={post.id} className="post">
            <h3>{post.title}</h3>
            {post?.tags?.map((tag, index) => {
              return <span key={index}>{tag}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export default PostList;
