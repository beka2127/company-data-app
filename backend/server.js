// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Data Persistence Setup ---
const DATA_FILE = path.join(__dirname, 'data.json');
console.log(`[BACKEND] Data file path: ${DATA_FILE}`); // Log the exact path

// Function to read data from data.json
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            console.log('[BACKEND] data.json does not exist. Creating with initial structure.');
            const initialData = {
                users: [],
                departments: [],
                tasks: [],
                announcements: [],
                attachments: []
            };
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
            console.log('[BACKEND] data.json created successfully with initial structure.');
            return initialData;
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const parsedData = JSON.parse(data);
        const requiredKeys = ['users', 'departments', 'tasks', 'announcements', 'attachments'];
        const missingKeys = requiredKeys.filter(key => !parsedData.hasOwnProperty(key));
        if (missingKeys.length > 0) {
            console.warn(`[BACKEND] data.json missing keys: ${missingKeys.join(', ')}. Initializing missing parts.`);
            return { ...readDataFallback(), ...parsedData };
        }
        console.log('[BACKEND] data.json read successfully.');
        return parsedData;
    } catch (error) {
        console.error(`[BACKEND ERROR] Error reading data.json: ${error.message}`);
        console.warn('[BACKEND] Attempting to recover by re-initializing data.json.');
        return readDataFallback();
    }
};

// Fallback to create a clean data structure if read fails
const readDataFallback = () => {
    const initialData = {
        users: [],
        departments: [],
        tasks: [],
        announcements: [],
        attachments: []
    };
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('[BACKEND] data.json re-initialized due to error or corruption.');
    } catch (writeError) {
        console.error(`[BACKEND ERROR] Failed to write initial data.json during fallback: ${writeError.message}`);
        console.error(`[BACKEND ERROR] Check file permissions for: ${DATA_FILE}`);
    }
    return initialData;
};

// Function to write data to data.json
const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('[BACKEND] data.json updated successfully.');
    } catch (error) {
        console.error(`[BACKEND ERROR] Error writing data.json: ${error.message}`);
        console.error(`[BACKEND ERROR] Check file permissions for: ${DATA_FILE}`);
    }
};

// Helper to generate IDs
const generateId = (prefix) => {
    const data = readData();
    let maxIdNum = 0;
    let items;

    switch (prefix) {
        case 'U': items = data.users; break;
        case 'D': items = data.departments; break;
        case 'T': items = data.tasks; break;
        case 'A': items = data.announcements; break;
        case 'AT': items = data.attachments; break;
        default: return prefix + String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    }

    items.forEach(item => {
        if (item.id && item.id.startsWith(prefix)) {
            const num = parseInt(item.id.substring(prefix.length));
            if (!isNaN(num) && num > maxIdNum) {
                maxIdNum = num;
            }
        }
    });
    return prefix + String(maxIdNum + 1).padStart(3, '0');
};

// --- Multer Storage for File Uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        console.log(`[BACKEND] Upload directory: ${uploadDir}`);
        if (!fs.existsSync(uploadDir)) {
            console.log('[BACKEND] Uploads directory does not exist. Creating it.');
            try {
                fs.mkdirSync(uploadDir, { recursive: true });
                console.log('[BACKEND] Uploads directory created successfully.');
            } catch (err) {
                console.error(`[BACKEND ERROR] Failed to create uploads directory: ${err.message}`);
                cb(err, null); // Pass error to multer
                return;
            }
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- API Endpoints ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const data = readData();
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, message: 'Login successful!', user: { id: user.id, username: user.username, role: user.role, departmentId: user.departmentId } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
});

app.get('/api/users', (req, res) => { const data = readData(); res.json(data.users); });
app.get('/api/departments', (req, res) => { const data = readData(); res.json(data.departments); });
app.get('/api/tasks', (req, res) => { const data = readData(); res.json(data.tasks); });
app.get('/api/announcements', (req, res) => { const data = readData(); res.json(data.announcements); });
app.get('/api/attachments', (req, res) => { const data = readData(); res.json(data.attachments); });

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ message: 'File uploaded successfully!', filePath: filePath, fileName: req.file.originalname });
});

// User CRUD
app.post('/api/users', (req, res) => {
    const data = readData();
    const newUser = { id: generateId('U'), ...req.body };
    data.users.push(newUser);
    writeData(data);
    res.status(201).json(newUser);
});
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    const data = readData();
    const index = data.users.findIndex(u => u.id === id);
    if (index !== -1) {
        data.users[index] = { ...data.users[index], ...updatedUser };
        writeData(data);
        res.json(data.users[index]);
    } else {
        res.status(404).json({ message: 'User not found.' });
    }
});
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const initialLength = data.users.length;
    data.users = data.users.filter(u => u.id !== id);
    if (data.users.length < initialLength) {
        writeData(data);
        res.status(200).json({ message: 'User deleted successfully.' });
    } else {
        res.status(404).json({ message: 'User not found.' });
    }
});

// Department CRUD
app.post('/api/departments', (req, res) => {
    const data = readData();
    const newDepartment = { id: generateId('D'), ...req.body };
    data.departments.push(newDepartment);
    writeData(data);
    res.status(201).json(newDepartment);
});
app.put('/api/departments/:id', (req, res) => {
    const { id } = req.params;
    const updatedDepartment = req.body;
    const data = readData();
    const index = data.departments.findIndex(d => d.id === id);
    if (index !== -1) {
        data.departments[index] = { ...data.departments[index], ...updatedDepartment };
        writeData(data);
        res.json(data.departments[index]);
    } else {
        res.status(404).json({ message: 'Department not found.' });
    }
});
app.delete('/api/departments/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const initialLength = data.departments.length;
    const usersInDepartment = data.users.filter(u => u.departmentId === id);
    if (usersInDepartment.length > 0) {
        return res.status(400).json({ message: 'Cannot delete department: Users are still assigned to it.' });
    }
    data.departments = data.departments.filter(d => d.id !== id);
    if (data.departments.length < initialLength) {
        writeData(data);
        res.status(200).json({ message: 'Department deleted successfully.' });
    } else {
        res.status(404).json({ message: 'Department not found.' });
    }
});

// Task CRUD
app.post('/api/tasks', (req, res) => {
    const data = readData();
    const newTask = {
        id: generateId('T'),
        name: req.body.name,
        status: req.body.status || 'Pending',
        assignedTo: req.body.assignedTo || null,
        dueDate: req.body.dueDate || null,
        departmentId: req.body.departmentId || null,
        attachment: null
    };
    data.tasks.push(newTask);
    writeData(data);
    res.status(201).json(newTask);
});
app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const updatedTaskData = req.body;
    const data = readData();
    const index = data.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        data.tasks[index] = {
            ...data.tasks[index],
            name: updatedTaskData.name,
            status: updatedTaskData.status,
            assignedTo: updatedTaskData.assignedTo || null,
            dueDate: updatedTaskData.dueDate || null,
            departmentId: updatedTaskData.departmentId || null,
        };
        writeData(data);
        res.json(data.tasks[index]);
    } else {
        res.status(404).json({ message: 'Task not found.' });
    }
});
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const initialLength = data.tasks.length;
    data.tasks = data.tasks.filter(t => t.id !== id);
    if (data.tasks.length < initialLength) {
        writeData(data);
        res.status(200).json({ message: 'Task deleted successfully.' });
    } else {
        res.status(404).json({ message: 'Task not found.' });
    }
});

// Announcement CRUD
app.post('/api/announcements', (req, res) => {
    const data = readData();
    const newAnnouncement = {
        id: generateId('A'),
        name: req.body.name,
        content: req.body.content,
        postedAt: new Date().toISOString(),
        departmentId: req.body.departmentId === 'null' ? null : req.body.departmentId
    };
    data.announcements.push(newAnnouncement);
    writeData(data);
    res.status(201).json(newAnnouncement);
});
app.put('/api/announcements/:id', (req, res) => {
    const { id } = req.params;
    const updatedAnnouncementData = req.body;
    const data = readData();
    const index = data.announcements.findIndex(a => a.id === id);
    if (index !== -1) {
        data.announcements[index] = {
            ...data.announcements[index],
            name: updatedAnnouncementData.name,
            content: updatedAnnouncementData.content,
            departmentId: updatedAnnouncementData.departmentId === 'null' ? null : updatedAnnouncementData.departmentId
        };
        writeData(data);
        res.json(data.announcements[index]);
    } else {
        res.status(404).json({ message: 'Announcement not found.' });
    }
});
app.delete('/api/announcements/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const initialLength = data.announcements.length;
    data.announcements = data.announcements.filter(a => a.id !== id);
    if (data.announcements.length < initialLength) {
        writeData(data);
        res.status(200).json({ message: 'Announcement deleted successfully.' });
    } else {
        res.status(404).json({ message: 'Announcement not found.' });
    }
});

// Attachment CRUD
app.post('/api/attachments', (req, res) => {
    const data = readData();
    const newAttachment = {
        id: generateId('AT'),
        name: req.body.name,
        fileUrl: req.body.fileUrl,
        postedAt: new Date().toISOString(),
        departmentId: req.body.departmentId
    };
    data.attachments.push(newAttachment);
    writeData(data);
    res.status(201).json(newAttachment);
});
app.put('/api/attachments/:id', (req, res) => {
    const { id } = req.params;
    const updatedAttachmentData = req.body;
    const data = readData();
    const index = data.attachments.findIndex(a => a.id === id);
    if (index !== -1) {
        data.attachments[index] = {
            ...data.attachments[index],
            name: updatedAttachmentData.name,
            departmentId: updatedAttachmentData.departmentId
        };
        writeData(data);
        res.json(data.attachments[index]);
    } else {
        res.status(404).json({ message: 'Attachment not found.' });
    }
});
app.delete('/api/attachments/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const attachmentToDelete = data.attachments.find(a => a.id === id);
    if (attachmentToDelete) {
        const relativeFilePath = attachmentToDelete.fileUrl;
        const absoluteFilePath = path.join(__dirname, relativeFilePath);
        if (fs.existsSync(absoluteFilePath)) {
            fs.unlink(absoluteFilePath, (err) => {
                if (err) {
                    console.error(`[BACKEND ERROR] Error deleting physical file ${absoluteFilePath}: ${err.message}`);
                } else {
                    console.log(`[BACKEND] Deleted physical file: ${absoluteFilePath}`);
                }
            });
        } else {
            console.warn(`[BACKEND WARN] File not found for deletion: ${absoluteFilePath}`);
        }
        data.attachments = data.attachments.filter(a => a.id !== id);
        writeData(data);
        res.status(200).json({ message: 'Attachment deleted successfully.' });
    } else {
        res.status(404).json({ message: 'Attachment not found.' });
    }
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`[BACKEND] Backend server running on http://localhost:${PORT}`);
    readData(); // Ensure initial data.json exists or is created
});