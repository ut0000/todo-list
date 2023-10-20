require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');

const app = express();
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const ProjectSchema = new mongoose.Schema({
    title: String,
    technologies: String,
    frontend: String,
    backend: String,
    databases: String,
    infrastructure: String
});

const Project = mongoose.model('Project', ProjectSchema);

const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

app.post('/upload', upload.single('spreadsheet'), async (req, res) => {
    try {
        const buffer = req.file.buffer; 
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        const data = XLSX.utils.sheet_to_json(worksheet);

        // Process and save to MongoDB
        for (const item of data) {
            const project = new Project({
                title: item["Project.Title"],
                technologies: item["Project.Technologies"],
                frontend: item["Technical_Skillset.Frontend"],
                backend: item["Technical_Skillset.Backend"],
                databases: item["Technical_Skillset.Databases"],
                infrastructure: item["Technical_Skillset.Infrastructure"]
            });

            await project.save();
        }

        res.status(200).send({ message: 'Data uploaded successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to process the file.' });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on http://localhost:${process.env.PORT || 3000}`);
});
