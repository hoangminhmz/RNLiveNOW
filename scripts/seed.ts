import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rooms = [
    { name: 'Room 1' },
    { name: 'Room 2' },
    { name: 'Room 3' },
    { name: 'Room 4' },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { id: room.name },
      update: {},
      create: {
        id: room.name,
        name: room.name,
      },
    });
  }

  // Add some sample patients
  const now = new Date();
  const samplePatients = [
    {
      name: 'John Doe',
      service: 'Cleaning',
      appointmentTime: new Date(new Date().setHours(9, 0, 0, 0)),
      status: 'scheduled',
    },
    {
      name: 'Jane Smith',
      service: 'Filling',
      appointmentTime: new Date(new Date().setHours(10, 30, 0, 0)),
      status: 'scheduled',
    },
    {
      name: 'Robert Brown',
      service: 'Root Canal',
      appointmentTime: new Date(new Date().setHours(11, 0, 0, 0)),
      status: 'waiting',
      checkinTime: new Date(new Date().setMinutes(now.getMinutes() - 15)),
    },
    {
      name: 'Emily Davis',
      service: 'Orthodontics',
      appointmentTime: new Date(new Date().setHours(8, 30, 0, 0)),
      status: 'in_room',
      checkinTime: new Date(new Date().setHours(8, 20, 0, 0)),
      treatmentStartTime: new Date(new Date().setMinutes(now.getMinutes() - 20)),
      roomId: 'Room 1',
    },
    {
      name: 'Michael Wilson',
      service: 'Extraction',
      appointmentTime: new Date(new Date().setHours(8, 0, 0, 0)),
      status: 'done',
      checkinTime: new Date(new Date().setHours(7, 50, 0, 0)),
      treatmentStartTime: new Date(new Date().setHours(8, 5, 0, 0)),
      treatmentEndTime: new Date(new Date().setHours(8, 45, 0, 0)),
      roomId: 'Room 2',
    },
    {
      name: 'Sarah Miller',
      service: 'Checkup',
      appointmentTime: new Date(new Date().setHours(9, 30, 0, 0)),
      status: 'done',
      checkinTime: new Date(new Date().setHours(9, 20, 0, 0)),
      treatmentStartTime: new Date(new Date().setHours(9, 35, 0, 0)),
      treatmentEndTime: new Date(new Date().setHours(10, 0, 0, 0)),
      roomId: 'Room 3',
    },
    {
      name: 'David Taylor',
      service: 'Cleaning',
      appointmentTime: new Date(new Date().setHours(10, 0, 0, 0)),
      status: 'in_room',
      checkinTime: new Date(new Date().setHours(9, 55, 0, 0)),
      treatmentStartTime: new Date(new Date().setHours(10, 5, 0, 0)),
      roomId: 'Room 4',
    }
  ];

  for (const p of samplePatients) {
    await prisma.patient.create({ data: p });
  }

  console.log(`Seeded 4 rooms and ${samplePatients.length} sample patients`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
