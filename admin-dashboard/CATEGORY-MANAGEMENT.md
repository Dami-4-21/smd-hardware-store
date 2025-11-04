# 🗂️ Category Management System

Complete hierarchical category management with add, edit, and delete functionality for categories and subcategories.

---

## ✨ **Features Implemented**

### **1. Category List View** 📋
✅ Hierarchical tree structure  
✅ Expandable/collapsible categories  
✅ Visual folder icons (open/closed)  
✅ Product count badges  
✅ Category descriptions  
✅ Indented subcategories  

### **2. Statistics Dashboard** 📊
✅ Total categories count  
✅ Total subcategories count  
✅ Total products count  
✅ Color-coded stat cards  

### **3. Add Category** ➕
✅ Add top-level categories  
✅ Add subcategories to any parent  
✅ Auto-generate URL slug from name  
✅ Category name (required)  
✅ URL slug (required, auto-formatted)  
✅ Description (optional)  
✅ Real-time validation  

### **4. Edit Category** ✏️
✅ Edit category name  
✅ Edit URL slug  
✅ Edit description  
✅ Works for both categories and subcategories  
✅ Form pre-filled with existing data  

### **5. Delete Category** 🗑️
✅ Delete confirmation modal  
✅ Warning for categories with subcategories  
✅ Warning for categories with products  
✅ Cascade delete (removes subcategories too)  
✅ Cannot be undone warning  

---

## 🎨 **UI/UX Features**

### **Tree View**
- **Expand/Collapse**: Click chevron icon to show/hide subcategories
- **Visual Hierarchy**: Indented subcategories with different background
- **Folder Icons**: Open folder when expanded, closed when collapsed
- **Product Badges**: Blue pill showing product count

### **Action Buttons**
- **Add Subcategory** (➕): Only on top-level categories
- **Edit** (✏️): Available on all categories
- **Delete** (🗑️): Available on all categories

### **Modals**
- **Category Modal**: Clean form with validation
- **Delete Modal**: Warning with impact details

### **Responsive Design**
- Mobile-friendly
- Touch-optimized
- Adaptive layout

---

## 📁 **File Structure**

```
admin-dashboard/src/
├── pages/
│   └── CategoriesPage.tsx           # Main category management page
└── components/categories/
    ├── CategoryModal.tsx            # Add/Edit category modal
    └── DeleteConfirmModal.tsx       # Delete confirmation modal
```

---

## 🚀 **How to Use**

### **Access Category Management:**
```bash
# Dashboard running at http://localhost:5174
# Click "Categories" in sidebar
# Or visit: http://localhost:5174/categories
```

---

## 📝 **User Guide**

### **Add a Top-Level Category:**
1. Click **"Add Category"** button (top right)
2. Enter category name (e.g., "Power Tools")
3. Slug auto-generates (e.g., "power-tools")
4. Add description (optional)
5. Click **"Create Category"**

### **Add a Subcategory:**
1. Find the parent category in the list
2. Click the **➕ icon** next to the parent
3. Enter subcategory name (e.g., "Drills")
4. Slug auto-generates (e.g., "drills")
5. Add description (optional)
6. Click **"Create Category"**
7. Parent category auto-expands to show new subcategory

### **Edit a Category:**
1. Click the **✏️ icon** next to any category
2. Modify name, slug, or description
3. Click **"Save Changes"**

### **Delete a Category:**
1. Click the **🗑️ icon** next to any category
2. Read the warning message
3. If category has subcategories or products, warnings shown
4. Click **"Delete Category"** to confirm
5. Or click **"Cancel"** to abort

### **Expand/Collapse Categories:**
1. Click the **chevron icon** (▶ or ▼) next to category name
2. Subcategories appear/disappear
3. Folder icon changes (open/closed)

---

## 💡 **Example Categories**

### **Hardware Store Structure:**

```
📁 Power Tools (45 products)
  ├── 📄 Drills (15 products)
  ├── 📄 Saws (12 products)
  └── 📄 Sanders (8 products)

📁 Hand Tools (78 products)
  ├── 📄 Hammers (10 products)
  ├── 📄 Screwdrivers (25 products)
  └── 📄 Wrenches (18 products)

📁 Electrical (120 products)
  ├── 📄 Cables (45 products)
  ├── 📄 Switches (30 products)
  └── 📄 Outlets (25 products)

📁 Plumbing (95 products)

📁 Hardware (200 products)

📁 Safety Equipment (35 products)
```

---

## 🎯 **Features Explained**

### **Hierarchical Structure**
- **Top-Level Categories**: Main product groups (e.g., Power Tools)
- **Subcategories**: Specific product types (e.g., Drills, Saws)
- **One Level Deep**: Currently supports parent → child (can be extended)

### **Auto-Generated Slugs**
- Converts name to URL-friendly format
- Lowercase letters only
- Spaces become hyphens
- Special characters removed
- Example: "Power Tools" → "power-tools"

### **Product Count**
- Shows number of products in each category
- Includes products in subcategories (for parent count)
- Updates when products added/removed
- Displayed in blue badge

### **Cascade Delete**
- Deleting a parent deletes all subcategories
- Products become uncategorized (not deleted)
- Warning shown before deletion
- Cannot be undone

---

## 📊 **Statistics**

The dashboard shows:

1. **Total Categories**: Count of top-level categories
2. **Subcategories**: Count of all subcategories
3. **Total Products**: Sum of all products across categories

---

## 🔧 **Technical Details**

### **State Management**
```typescript
- categories: Category[]           // All categories
- expandedCategories: Set<string>  // IDs of expanded categories
- showModal: boolean               // Show add/edit modal
- showDeleteModal: boolean         // Show delete confirmation
- editingCategory: Category | null // Category being edited
- deletingCategory: Category | null // Category being deleted
- parentCategory: Category | null  // Parent for new subcategory
```

### **Category Interface**
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  productCount: number;
  subcategories?: Category[];
}
```

### **Key Functions**
- `toggleExpand()` - Expand/collapse category
- `handleAddCategory()` - Open modal for new category
- `handleEditCategory()` - Open modal to edit
- `handleDeleteCategory()` - Open delete confirmation
- `handleSaveCategory()` - Save new or updated category
- `handleConfirmDelete()` - Execute deletion
- `renderCategory()` - Recursive render for tree structure

---

## 🎨 **UI Components**

### **CategoriesPage**
- Main page component
- Stats dashboard
- Category tree list
- Modal management

### **CategoryModal**
- Add/Edit form
- Auto-slug generation
- Validation
- Parent category indicator

### **DeleteConfirmModal**
- Confirmation dialog
- Warning messages
- Impact summary
- Destructive action styling

---

## ✅ **Validation Rules**

### **Category Name:**
- ✅ Required
- ✅ Cannot be empty
- ✅ No length limit (reasonable length recommended)

### **URL Slug:**
- ✅ Required
- ✅ Auto-generated from name
- ✅ Lowercase only
- ✅ Hyphens for spaces
- ✅ No special characters
- ✅ Must be unique (not enforced in UI, needs backend)

### **Description:**
- ✅ Optional
- ✅ No length limit
- ✅ Character count shown

---

## 🚨 **Warnings & Alerts**

### **Delete Warnings:**

**Category with Subcategories:**
```
⚠️ Warning:
• This category has X subcategories that will also be deleted.
```

**Category with Products:**
```
⚠️ Warning:
• This category contains X products. These products will become uncategorized.
```

**Both:**
```
⚠️ Warning:
• This category has X subcategories that will also be deleted.
• This category contains X products. These products will become uncategorized.
```

---

## 🔄 **Current Status**

### **✅ Complete:**
- Hierarchical tree view
- Add top-level categories
- Add subcategories
- Edit categories
- Delete categories
- Expand/collapse
- Statistics dashboard
- Validation
- Confirmation modals
- Responsive design

### **📝 Mock Data:**
- 6 sample categories
- 9 sample subcategories
- Mock product counts
- Saves to state (not persisted)

---

## 🚀 **Next Steps (Backend Integration)**

### **API Endpoints Needed:**
```typescript
GET    /api/categories              // Get all categories
GET    /api/categories/:id          // Get single category
POST   /api/categories              // Create category
PUT    /api/categories/:id          // Update category
DELETE /api/categories/:id          // Delete category
GET    /api/categories/:id/products // Get products in category
```

### **Features to Add:**
1. **Backend Integration**
   - Connect to real API
   - Persist to database
   - Load categories on mount

2. **Advanced Features**
   - Drag & drop reordering
   - Category images/icons
   - Multiple subcategory levels
   - Bulk operations
   - Import/Export

3. **Product Management**
   - Assign products to categories
   - Move products between categories
   - View products in category

4. **Search & Filter**
   - Search categories by name
   - Filter by product count
   - Sort options

---

## 💻 **Code Examples**

### **Add a Category:**
```typescript
const newCategory = {
  name: "Power Tools",
  slug: "power-tools",
  description: "Electric and battery-powered tools"
};
handleSaveCategory(newCategory);
```

### **Add a Subcategory:**
```typescript
const parentCategory = categories.find(c => c.id === "1");
setParentCategory(parentCategory);
const newSubcategory = {
  name: "Drills",
  slug: "drills",
  description: "Cordless and corded drills"
};
handleSaveCategory(newSubcategory);
```

### **Edit a Category:**
```typescript
const categoryToEdit = categories.find(c => c.id === "1");
setEditingCategory(categoryToEdit);
const updates = {
  name: "Updated Name",
  description: "Updated description"
};
handleSaveCategory(updates);
```

---

## 🎓 **Best Practices**

1. **Naming Categories:**
   - Use clear, descriptive names
   - Keep names concise
   - Use title case (e.g., "Power Tools")

2. **URL Slugs:**
   - Let auto-generation handle it
   - Only edit if needed
   - Keep slugs short and readable

3. **Descriptions:**
   - Brief but informative
   - Help customers understand category
   - Optional but recommended

4. **Organization:**
   - Group related products
   - Don't create too many levels
   - Balance breadth vs depth

5. **Deletion:**
   - Review warnings carefully
   - Consider moving products first
   - Backup before bulk deletions

---

## 🐛 **Known Limitations**

1. **Mock Data**: Currently uses hardcoded categories
2. **No Persistence**: Changes lost on page refresh
3. **One Level Deep**: Only parent → child supported
4. **No Reordering**: Categories in creation order
5. **No Images**: Text-only categories
6. **No Bulk Operations**: One at a time only

---

## 📞 **Support**

For questions or issues:
1. Check this documentation
2. Review the UI tooltips
3. Test with mock data first
4. Contact development team

---

**Built with ❤️ for SQB Tunisie Hardware Store**

*Last Updated: October 29, 2025*
