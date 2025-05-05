// // __tests__/auth.test.ts
// import request from "supertest";
// import app from "../src/u";  // your exported Express instance
// import User from "../src/models/userModel";

// describe("Auth Routes", () => {
//   it("registers a new user", async () => {
//     const res = await request(app)
//       .post("/api/auth/register")
//       .send({
//         name:     "Alice",
//         email:    "alice@example.com",
//         password: "password1"
//       });
//     expect(res.status).toBe(201);
//     expect(res.body.message).toBe("User registered successfully");

//     const users = await User.find({});
//     expect(users).toHaveLength(1);
//     expect(users[0].email).toBe("alice@example.com");
//   });

//   it("rejects invalid registration data", async () => {
//     const res = await request(app)
//       .post("/api/auth/register")
//       .send({ name: "Bob", email: "not-an-email", password: "123" });
//     expect(res.status).toBe(400);
//     expect(res.body.errors).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({ field: "email" }),
//         expect.objectContaining({ field: "password" })
//       ])
//     );
//   });
// });
