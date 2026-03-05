import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.join(__dirname, "prisma", "dev.db")}`,
    },
  },
  log: ['error', 'warn'],
});
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

const PORT = 3000;

app.use(cors());
app.use(express.json());

// ... existing imports

// API Routes
app.get("/api/rooms", async (req, res) => {
  const rooms = await prisma.room.findMany({
    include: { patients: { where: { status: "in_room" } } },
  });
  res.json(rooms);
});

app.post("/api/rooms", async (req, res) => {
  try {
    const { name } = req.body;
    const room = await prisma.room.create({
      data: { name },
      include: { patients: { where: { status: "in_room" } } },
    });
    io.emit("rooms:updated");
    res.json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
});

app.patch("/api/rooms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const room = await prisma.room.update({
      where: { id },
      data: { name },
      include: { patients: { where: { status: "in_room" } } },
    });
    io.emit("rooms:updated");
    res.json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Failed to update room" });
  }
});

app.delete("/api/rooms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Check if room has active patients
    const room = await prisma.room.findUnique({
      where: { id },
      include: { patients: { where: { status: "in_room" } } },
    });

    if (room && room.patients.length > 0) {
      return res.status(400).json({ error: "Cannot delete room with active patients" });
    }

    await prisma.room.delete({ where: { id } });
    io.emit("rooms:updated");
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Failed to delete room" });
  }
});

app.get("/api/patients", async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const where: any = {};
    if (status) {
      where.status = status as string;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { phone: { contains: search as string } }
      ];
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { appointmentTime: "asc" },
      include: { logs: { orderBy: { createdAt: 'desc' } } }
    });
    res.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

app.post("/api/patients", async (req, res) => {
  try {
    const { name, phone, service, appointmentTime, note, status } = req.body;
    const patient = await prisma.patient.create({
      data: {
        name,
        phone,
        service,
        note,
        status: status || 'scheduled',
        appointmentTime: new Date(appointmentTime),
        logs: {
          create: {
            action: "created",
            details: "Patient scheduled"
          }
        }
      },
      include: { logs: true }
    });
    io.emit("patient:created", patient);
    res.json(patient);
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

app.patch("/api/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, roomId, checkinTime, treatmentStartTime, treatmentEndTime, note } = req.body;

    const updateData: any = {};
    const logsToCreate = [];

    if (status) {
      updateData.status = status;
      logsToCreate.push({ action: "status_change", details: `Status changed to ${status}` });
    }
    if (roomId !== undefined) {
      updateData.roomId = roomId;
      const roomName = roomId ? (await prisma.room.findUnique({ where: { id: roomId } }))?.name : "Waiting Area";
      logsToCreate.push({ action: "room_move", details: `Moved to ${roomName || 'waiting area'}` });
    }
    if (checkinTime) updateData.checkinTime = new Date(checkinTime);
    if (treatmentStartTime) updateData.treatmentStartTime = new Date(treatmentStartTime);
    if (treatmentEndTime) updateData.treatmentEndTime = new Date(treatmentEndTime);
    if (note !== undefined) {
      updateData.note = note;
      logsToCreate.push({ action: "note_update", details: "Note updated" });
    }

    if (logsToCreate.length > 0) {
      updateData.logs = {
        create: logsToCreate
      };
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
      include: { logs: { orderBy: { createdAt: 'desc' } } }
    });

    io.emit("patient:updated", patient);
    res.json(patient);
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ error: "Failed to update patient" });
  }
});

app.post("/api/patients/bulk", async (req, res) => {
  try {
    const patientsData = req.body;
    
    if (!Array.isArray(patientsData)) {
      return res.status(400).json({ error: "Input must be an array" });
    }

    console.log(`Processing bulk import of ${patientsData.length} patients`);

    const createdPatients = [];
    
    // Process sequentially to ensure stability with SQLite
    for (const p of patientsData) {
      try {
        const appointmentTime = new Date(p.appointmentTime);
        if (isNaN(appointmentTime.getTime())) {
          console.warn(`Skipping patient ${p.name}: Invalid appointment time`);
          continue;
        }

        const patient = await prisma.patient.create({
          data: {
            name: String(p.name).trim(),
            phone: p.phone ? String(p.phone).trim() : null,
            service: p.service ? String(p.service).trim() : null,
            note: p.note ? String(p.note).trim() : null,
            status: p.status || 'scheduled',
            appointmentTime: appointmentTime,
          },
        });
        createdPatients.push(patient);
      } catch (err) {
        console.error(`Failed to create patient ${p.name}:`, err);
        // Continue with next patient instead of failing entire batch
      }
    }

    console.log(`Successfully imported ${createdPatients.length} patients`);
    io.emit("patients:bulk_created", createdPatients);
    res.json(createdPatients);
  } catch (error) {
    console.error("Error in /api/patients/bulk:", error);
    res.status(500).json({ error: "Failed to import patients", details: String(error) });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }
}

setupVite().then(() => {
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
