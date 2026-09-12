const http = require("http");

const API_BASE = "http://localhost:5001/api";

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("🚀 Starting Past Event Registration Blocking E2E Test...");

  let token = null;
  let eventId = null;

  try {
    // 1. Log in as organizer
    console.log("⏳ Logging in as organizer...");
    const loginRes = await request("POST", "/auth/login", {
      email: "organizer@hash.edu",
      password: "password123"
    });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    token = loginRes.body.token;
    console.log("✅ Logged in successfully!");

    // 2. Create an event in the past (yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    console.log(`⏳ Creating an event set in the past (${yesterday.toISOString()})...`);
    const createRes = await request("POST", "/events", {
      title: "Yesterday Event",
      description: "This event happened yesterday.",
      date: yesterday.toISOString(),
      location: "Old Hall",
    }, token);

    if (createRes.status !== 201) {
      throw new Error(`Failed to create event. Status: ${createRes.status}`);
    }

    eventId = createRes.body.id;
    console.log(` - Created "Yesterday Event" (ID: ${eventId})`);

    // Activate the event so it is open/active
    console.log("⏳ Activating the event...");
    await request("PATCH", `/events/${eventId}`, {
      status: "ACTIVE"
    }, token);
    console.log(" - Event activated.");

    // 3. Attempt to register for this past event - SHOULD FAIL
    console.log("⏳ Attempting to register for the past event...");
    const regRes = await request("POST", `/events/${eventId}/register`, {
      answers: {
        "Full Name": "Test User",
        "Email Address": "testuser@example.com"
      }
    });

    console.log(` - Received status code: ${regRes.status}`);
    console.log(` - Received body:`, regRes.body);

    if (regRes.status !== 400) {
      throw new Error(`Expected status 400 Bad Request, but got ${regRes.status}`);
    }

    const expectedMessage = "Registration is closed because the registration deadline has passed.";
    if (regRes.body.message !== expectedMessage) {
      throw new Error(`Expected error message "${expectedMessage}", but got "${regRes.body.message}"`);
    }

    console.log("✅ Registration for the past event was successfully blocked with the correct message!");

    // 4. Cleanup
    console.log("⏳ Deleting test event...");
    const deleteRes = await request("DELETE", `/events/${eventId}`, null, token);
    if (deleteRes.status !== 200) {
      console.warn(`⚠️ Failed to delete event ${eventId}. Status: ${deleteRes.status}`);
    }
    console.log("✅ Test event deleted.");

    console.log("\n🏆 Past Event Registration E2E Test PASSED successfully!");

  } catch (error) {
    console.error("❌ E2E Validation failed:", error.message);
    if (token && eventId) {
      console.log("⏳ Performing emergency cleanup...");
      await request("DELETE", `/events/${eventId}`, null, token);
    }
    process.exit(1);
  }
}

runTests();
