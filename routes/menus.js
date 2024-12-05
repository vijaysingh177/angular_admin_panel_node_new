const express = require('express');
const connection = require('../connection');
const authenticateToken = require('../middleware/authenticateToken');
// const connection = require('../connection');
const router = express.Router();


// Create a new menu  router.post('/add-menu',authenticateToken, (req, res) => {
    router.post('/add-menu', (req, res) => {
        const menu = req.body;
    
        // Validate required fields
        if (!menu.name || !menu.link) {
            return res.status(400).json({ message: "Menu name and URL are required." });
        }
    
        // Fetch the next available itemId
        const getItemIdQuery = "SELECT COALESCE(MAX(itemId), 0) + 1 AS nextItemId FROM menus";
        connection.query(getItemIdQuery, (err, result) => {
            if (err) {
                console.error("Error fetching serial number:", err);
                return res.status(500).json({ message: "Error fetching serial number.", error: err });
            }
    
            const itemId = result[0].nextItemId; // Get the next available itemId
            const parentId = menu.parent_id || 0; // Default to 0 if no parent
            const icon = menu.icon || ''; // Default to empty string
            const templateId = menu.template_id || 0; // Default to 0
    
            // Insert the menu into the database
            const insertQuery = `
                INSERT INTO menus (name, link, enableMenu, itemId, parent_id, icon, templateId)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [menu.name, menu.link, 1, itemId, parentId, icon, templateId];
    
            connection.query(insertQuery, values, (err, results) => {
                if (err) {
                    console.error('Error inserting menu:', err);
                    return res.status(500).json({ message: "Error inserting menu.", error: err });
                }
    
                console.log('Menu added successfully with ID:', results.insertId);
                return res.status(200).json({
                    status: 'success',
                    message: "Menu successfully added.",
                    id: results.insertId // Return the new menu ID
                });
            });
        });
    });
    
    



router.put('/assign-template/:id', (req, res) => {
    const { id } = req.params;
    const { template_id } = req.body;

    if (!template_id) {
        return res.status(400).json({ message: "Template ID is required." });
    }

    const query = "UPDATE menus SET template_id = ? WHERE id = ?";
    connection.query(query, [template_id, id], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "Template assigned successfully." });
        } else {
            return res.status(500).json(err);
        }
    });
});

// Enable or disable a menu
router.put('/toggle-menu/:id', (req, res) => {
    const { id } = req.params;
    const { enableMenu } = req.body;

    // Validate `enableMenu`
    if (typeof enableMenu !== 'boolean' && typeof enableMenu !== 'number') {
        return res.status(400).json({ message: "Invalid enable menu status." });
    }

    const query = "UPDATE menus SET enableMenu = ? WHERE id = ?";
    connection.query(query, [enableMenu, id], (err, results) => {
        if (!err) {

            return res.status(200).json({
                status: 'success',
                message: `Menu with ID ${id} has been ${enableMenu ? "enabled" : "disabled"} successfully.`,
              
            });
            //return res.status(200).json({ message: `Menu with ID ${id} has been ${enableMenu ? "enabled" : "disabled"} successfully.` });
        } else {
            return res.status(500).json(err);
        }
    });
});


// Update menu details
router.put('/update-menu/:id', (req, res) => {
    const { id } = req.params;
    const { menu } = req.body; // menu is the object

    const { name, link, icon, parent_id, enableMenu } = menu;

    let query = "UPDATE menus SET";
    let updates = [];
    let values = [];

    // Collect the updated fields
    if (name) {
        updates.push("name = ?");
        values.push(name);
    }
    if (link) {
        updates.push("link = ?");
        values.push(link);
    }
    if (icon) {
        updates.push("icon = ?");
        values.push(icon);
    }
    if (parent_id) {
        updates.push("parent_id = ?");
        values.push(parent_id);
    }
    if (typeof enableMenu === 'number') {
        updates.push("enableMenu = ?");
        values.push(enableMenu);
    }

    query += " " + updates.join(", ") + " WHERE id = ?";
    values.push(id);

    connection.query(query, values, (err, results) => {
        if (!err) {
            // If the menu has children, handle them separately
            // if (children && Array.isArray(children)) {
            //     children.forEach(child => {
            //         // Optionally, update children (implement your own logic here)
            //     });
            // }

            return res.status(200).json({
                status: 'success',
                message: "Menu Updated successfully.",
              
            });
            //return res.status(200).json({ message: "Menu updated successfully." });
        } else {
            return res.status(500).json(err);
        }
    });
});




// Delete a menu or all menus
router.delete('/delete-menu/:id?', (req, res) => {
    const { id } = req.params;

    // If `id` is provided, delete the specific menu; otherwise, delete all menus
    const query = id
        ? "DELETE FROM menus WHERE id = ?"
        : "DELETE FROM menus";

    const values = id ? [id] : []; // Include `id` in values only if it's provided

    connection.query(query, values, (err, results) => {
        if (!err) {
            const message = id
                ? `Menu with ID ${id} deleted successfully.`
                : "All menus deleted successfully.";
            // return res.status(200).json({ message });
            return res.status(200).json({
                status: 'success',
                message: "Menu Updated successfully.",
              
            });
        } else {
            return res.status(500).json(err);
        }
    });
});


// Get all menus or a specific menu
router.get('/get-menus/:id?', (req, res) => {
    const { id } = req.params;

    let query = "SELECT * FROM menus";
    let values = [];

    if (id) {
        query += " WHERE id = ?";
        values.push(id);
    }

    connection.query(query, values, (err, results) => {
        if (!err) {
            // Transform the flat menu results into a nested structure
            const transformedMenu = transformMenuData(results);

            return res.status(200).json({ results: transformedMenu });
        } else {
            return res.status(500).json(err);
        }
    });
});



router.put('/serial-number-update', async (req, res) => {
    const updatedMenus = req.body; // Expecting an array of menu items in the request body

    // Validate the input payload
    if (!Array.isArray(updatedMenus) || updatedMenus.length === 0) {
        return res.status(400).json({ message: 'Invalid payload: expected a non-empty array.' });
    }

    const updateQuery = `
        UPDATE menus
        SET parent_id = ?, itemId = ?
        WHERE id = ?
    `;

    try {
        // Validate all items for required fields
        for (const item of updatedMenus) {
            const { id, parent_id, itemId } = item;
            if (id == null || parent_id == null || itemId == null) {
                return res.status(400).json({
                    message: 'Invalid payload: missing required fields for one or more items.',
                });
            }
        }

        // Check for duplicate itemId within the same parent_id group
        const parentGroups = updatedMenus.reduce((groups, item) => {
            const { parent_id } = item;
            if (!groups[parent_id]) {
                groups[parent_id] = [];
            }
            groups[parent_id].push(item.itemId);
            return groups;
        }, {});

        for (const parentId in parentGroups) {
            const serialNumbers = parentGroups[parentId];
            const duplicates = serialNumbers.filter(
                (item, index) => serialNumbers.indexOf(item) !== index
            );
            if (duplicates.length > 0) {
                return res.status(400).json({
                    message: `Duplicate itemId found for parent_id ${parentId}: ${duplicates.join(', ')}`,
                });
            }
        }

        // Proceed with database updates if validation passes
        const updateResults = await Promise.all(
            updatedMenus.map(item => {
                const { id, parent_id, itemId } = item;

                return new Promise((resolve, reject) => {
                    connection.execute(updateQuery, [parent_id, itemId, id], (err, results) => {
                        if (err) {
                            reject(new Error(`Database error for ID ${id}: ${err.message}`));
                        } else if (results.affectedRows === 0) {
                            reject(new Error(`Menu item with ID ${id} not found or not updated.`));
                        } else {
                            resolve(results); // Resolve if the update was successful
                        }
                    });
                });
            })
        );

        // If all updates are successful
        if (updateResults.length === updatedMenus.length) {
            res.status(200).json({ message: 'All menus updated successfully.' });
        } else {
            res.status(500).json({ message: 'Some updates failed.', results: updateResults });
        }
    } catch (error) {
        console.error('Error updating menus:', error.message || error);
        res.status(500).json({
            message: 'Failed to update menus.',
            error: error.message || 'Unknown error',
        });
    }
});










function transformMenuData(menus) {
    const menuMap = new Map();
    const result = [];

    // Organize menus by their parent_id
    menus.forEach(menu => {
        menu.children = [];
        menuMap.set(menu.id, menu);

        // If parent_id is 0, it's a top-level menu
        if (menu.parent_id === 0) {
            result.push(menu);
        } else {
            // Add as a child to the correct parent if it exists
            const parentMenu = menuMap.get(menu.parent_id);
            if (parentMenu) {
                parentMenu.children.push(menu);
            }
        }
    });

    // Sort the top-level menus by itemId
    result.sort((a, b) => a.itemId - b.itemId);

    // Sort the children of each parent menu by itemId
    result.forEach(menu => {
        menu.children.sort((a, b) => a.itemId - b.itemId);
    });

    return result;
}



module.exports = router;
