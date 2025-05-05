// scripts/healthcheck.ts
import request from "supertest";
import app from "../src/server";

async function run() {
  console.log("→ Registering test user");
  const reg = await request(app)
    .post("/api/auth/register")
    .send({ name:"Test", email:"test@example.com", password:"pass123" });
  console.log("Status:", reg.status);
  if (reg.status !== 201) process.exit(1);

  console.log("→ Logging in");
  const login = await request(app)
    .post("/api/auth/login")
    .send({ email:"test@example.com", password:"pass123" });
  console.log("Status:", login.status);
  if (login.status !== 200) process.exit(1);

  const token = login.body.token;
  console.log("→ Fetching resumes (should be empty array)");
  const res = await request(app)
    .get("/api/resumes")
    .set("Authorization", `Bearer ${token}`);
  console.log("Status:", res.status, "Body:", res.body);
  if (res.status !== 200) process.exit(1);

  console.log("✅ Healthcheck passed");
  process.exit(0);
}

run();
