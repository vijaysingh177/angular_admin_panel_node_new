// routes/comments.js
const express = require('express');
const connection = require('../connection'); // Ensure your DB connection is correct
const router = express.Router();




router.get('/get-comment', (req, res) => {
    const { post_id } = req.query; 
    const { post_type } = req.query; 

    if (!post_id) {
        return res.status(400).json({ success: false, message: 'post_id is required' });
    }

 
    let query = "SELECT * FROM comments WHERE post_id = ?";
    let values = [post_id];

   
    if (post_type) {
        query += " AND post_type = ?";
        values.push(post_type);
    }

    // Execute the query
    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ success: false, message: 'Error fetching comments', error: err });
        }

     
        if (results.length === 0) {
            return res.status(200).json({ success: true, message: 'No comments found' });
        }

        const transformedMenu = transformMenuData(results);

       
        res.status(200).json({ success: true, data: transformedMenu });
    });
});



function transformMenuData(comments) {
    const commentMap = new Map();
    const result = [];

 
    comments.forEach(comment => {
        comment.children = [];
        commentMap.set(comment.comment_id, comment);

   
        if (comment.parent_id === 0) {
            result.push(comment);
        } else {
          
            const parentcomment = commentMap.get(comment.parent_id);
            if (parentcomment) {
                parentcomment.children.push(comment);
            } else {
        
                const newParent = { comment_id: comment.parent_id, children: [comment] };
                commentMap.set(comment.parent_id, newParent);
            }
        }
    });

    
    result.sort((a, b) => a.comment_id - b.comment_id);

   
    result.forEach(comment => {
        comment.children.sort((a, b) => a.comment_id - b.comment_id);
    });

    return result;
}





router.post('/save-comment', (req, res) => {
    const newComment = req.body; 

   
    if (!newComment.post_id || !newComment.comment || !newComment.post_title) {
        return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

  
    const parentId = newComment.parent_id || 0;

 
    const query = "INSERT INTO comments (post_id, post_type, post_type_id, status, comment, email, name, website, ip_address, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
        newComment.post_id,
        newComment.post_type,
        newComment.post_type_id,
        newComment.status,
        newComment.comment,
        newComment.email,
        newComment.name,
        newComment.website,
        newComment.ip_address,
        parentId, 
    ];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting comment:', err);
            return res.status(500).json({ success: false, message: 'Error saving comment', error: err });
        }

        res.status(200).json({ success: true, data: results });
    });
});





module.exports = router;




