// routes/blogs.js
const express = require('express');
const connection = require('../connection'); // Ensure your DB connection is correct
const router = express.Router();




router.get('/get-blogs/:blog_id?', (req, res) => {
  const { blog_id } = req.params;

  let query = 'SELECT * FROM blog';
  if (blog_id) {
      query += ' WHERE id = ?';
  }

  connection.query(query, [blog_id], (err, results) => {
      if (err) {
          console.error('Error fetching blogs:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.status(200).json({ success: true, data: results });
  });
});


router.post('/add-blog', (req, res) => {
  const newBlog = req.body;

  if (!newBlog || !newBlog.blog_title ) {
      return res.status(400).json({
          success: false,
          message: 'Invalid data',
      });
  }

  // Construct the SQL query
  const query = `
      INSERT INTO blog (
          comment_status, 
          featured_image, 
          ping_status, 
          blog_author, 
          blog_content, 
          blog_excerpt, 
          post_selected_categories, 
          blog_slug, 
          blog_status, 
          blog_title, 
          blog_type, 
          blog_type_id, 
          dynamic_fields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
      newBlog.comment_status || false,
      newBlog.featured_image || null,
      newBlog.ping_status || false,
      newBlog.blog_author || 'Anonymous',
      newBlog.blog_content || '',
      newBlog.blog_excerpt || '',
      JSON.stringify(newBlog.post_selected_categories || []),
      newBlog.blog_slug || '',
      newBlog.blog_status || 'draft',
      newBlog.blog_title,
      newBlog.blog_type || 'general',
      newBlog.blog_type_id || 0,
      JSON.stringify(newBlog.blogDynamicFields || {}),
  ];

  connection.query(query, values, (err, result) => {
      if (err) {
          console.error('Error adding blog:', err);
          return res.status(500).json({
              success: false,
              message: 'Database error',
          });
      }

      res.status(201).json({
          success: true,
          message: 'Blog added successfully',
          data: { id: result.insertId, ...newBlog },
      });
  });
});




router.put('/update-blog/:id', (req, res) => {
  const blogId = req.params.id;
  const updatedBlog = req.body;

  const query = `
    UPDATE blog
    SET 
      blog_title = ?,
      blog_content = ?,
      blog_excerpt = ?,
      blog_status = ?,
      comment_status = ?,
      ping_status = ?,
      blog_slug = ?,
      blog_author = ?,
      post_selected_categories = ?,
      featured_image = ?,
      post_updated_date = ?,
      dynamic_fields = ?
    WHERE id = ?
  `;

  const values = [
    updatedBlog.post_title,
    updatedBlog.post_content,
    updatedBlog.post_excerpt,
    updatedBlog.post_status,
    updatedBlog.comment_status,
    updatedBlog.ping_status,
    updatedBlog.post_slug,
    updatedBlog.post_author,
    JSON.stringify(updatedBlog.post_selected_categories),
    updatedBlog.featured_image,
    updatedBlog.post_updated_date,
    JSON.stringify(updatedBlog.blogDynamicFields),
    blogId
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating blog:', err);
      res.status(500).json({ success: false, message: 'Database error' });
    } else {
      res.status(200).json({ success: true, message: 'Blog updated successfully' });
    }
  });
});





function transformMenuData(comments) {
    const commentMap = new Map();
    const result = [];

    // Organize comments by their parent_id
    comments.forEach(comment => {
        comment.children = [];
        commentMap.set(comment.comment_id, comment);

        // If parent_id is 0, it's a top-level comment
        if (comment.parent_id === 0) {
            result.push(comment);
        } else {
            // Add as a child to the correct parent if it exists
            const parentcomment = commentMap.get(comment.parent_id);
            if (parentcomment) {
                parentcomment.children.push(comment);
            } else {
                // If the parent comment is not yet in the map, push it later
                // In case parent doesn't exist in the current set of comments, can be adjusted
                const newParent = { comment_id: comment.parent_id, children: [comment] };
                commentMap.set(comment.parent_id, newParent);
            }
        }
    });

    // Sort the top-level comments by itemId
    result.sort((a, b) => a.comment_id - b.comment_id);

    // Sort the children of each parent comment by itemcomment_id
    result.forEach(comment => {
        comment.children.sort((a, b) => a.comment_id - b.comment_id);
    });

    return result;
}





router.post('/save-blogs', (req, res) => {
    
});





module.exports = router;




