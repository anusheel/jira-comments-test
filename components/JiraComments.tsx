import React, { useState, useEffect } from 'react';
import { htmlToADF } from '@atlaskit/editor-common';

interface JiraCommentsProps {
  issueKey: string;
}

interface Comment {
  body: string;
  author: {
    displayName: string;
  };
}

const JiraComments: React.FC<JiraCommentsProps> = ({ issueKey }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [adfComment, setAdfComment] = useState<string>('');

  useEffect(() => {
    fetchComments();
  }, [issueKey]);

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/jira', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issueKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const addComment = async () => {
    try {
      const adf = htmlToADF(newComment);
      setAdfComment(JSON.stringify(adf, null, 2));
      const res = await fetch('/api/jira', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issueKey, comment: adf }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments([...comments, data]);
        setNewComment('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="p-4 rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-2">Comments</h2>
      {error && <div className="text-red-500">{error}</div>}
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment, index) => (
          <div key={index} className="border-b pb-2 mb-2">
            <p className="text-sm">{comment.body}</p>
            <p className="text-xs text-gray-500">{comment.author.displayName}</p>
          </div>
        ))
      )}
      <textarea
        className="w-full p-2 mb-2 border rounded"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a new comment"
      />
      <button className="mr-2 py-1 px-3 rounded bg-blue-500 text-white" onClick={fetchComments}>Fetch Comments</button>
      <button className="py-1 px-3 rounded bg-green-500 text-white" onClick={addComment}>Add Comment</button>
      {adfComment && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">ADF Format:</h3>
          <pre className="p-2 bg-gray-100 rounded">{adfComment}</pre>
        </div>
      )}
    </div>
  );
};

export default JiraComments;