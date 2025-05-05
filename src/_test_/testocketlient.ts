import { io } from "socket.io-client";

const socket = io("http://localhost:4000");
const TEST_RESUME_ID = "607f1f77bcf86cd799439011";

socket.on("connect", () => {
  console.log("Connected as", socket.id);
  socket.emit("joinResume", TEST_RESUME_ID);

  // simulate an update after 3s
  setTimeout(() => {
    socket.emit("resumeUpdated", {
      resumeId: TEST_RESUME_ID,
      changes: { summary: "Live update at " + new Date().toISOString() }
    });
  }, 3000);
});

socket.on("resumeChange", (changes) => {
  console.log("Received remote changes:", changes);
});
