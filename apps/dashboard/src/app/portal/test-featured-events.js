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
  console.log("🚀 Starting Featured Events Limit Validation E2E Test...");

  const createdEventIds = [];
  let token = null;

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

    // 2. Fetch existing admin events to see if any are featured and active, and unfeature them to have a clean state
    console.log("⏳ Checking existing events for cleanup...");
    const eventsRes = await request("GET", "/events", null, token);
    if (eventsRes.status !== 200) {
      throw new Error(`Failed to fetch admin events. Status: ${eventsRes.status}`);
    }

    const existingEvents = eventsRes.body;
    const activeFeatured = existingEvents.filter(e => e.isFeatured && e.status === "ACTIVE");
    console.log(`ℹ️ Found ${activeFeatured.length} active featured events already present. Unfeaturing them temporarily...`);
    for (const evt of activeFeatured) {
      await request("PATCH", `/events/${evt.id}`, { isFeatured: false }, token);
    }
    console.log("✅ Existing active featured events cleaned up.");

    // 3. Create 4 draft events
    console.log("⏳ Creating 4 draft events...");
    for (let i = 1; i <= 4; i++) {
      const createRes = await request("POST", "/events", {
        title: `Test Event ${i}`,
        description: `Description for test event ${i}`,
        date: new Date(Date.now() + 86400000 * i).toISOString(),
        location: `Location ${i}`,
        isFeatured: false
      }, token);

      if (createRes.status !== 201) {
        throw new Error(`Failed to create event ${i}. Status: ${createRes.status}`);
      }

      createdEventIds.push(createRes.body.id);
      console.log(` - Created "Test Event ${i}" (ID: ${createRes.body.id})`);
    }

    // 4. Activate and feature the first 3 events
    console.log("⏳ Activating and featuring the first 3 events (1, 2, and 3)...");
    for (let i = 0; i < 3; i++) {
      const updateRes = await request("PATCH", `/events/${createdEventIds[i]}`, {
        status: "ACTIVE",
        isFeatured: true
      }, token);

      if (updateRes.status !== 200) {
        throw new Error(`Failed to activate and feature event ${i + 1}. Status: ${updateRes.status}`);
      }
      console.log(` - Activated and featured Test Event ${i + 1} successfully.`);
    }

    // 5. Try to activate and feature the 4th event - SHOULD FAIL
    console.log("⏳ Attempting to activate and feature the 4th event (should fail)...");
    const failRes = await request("PATCH", `/events/${createdEventIds[3]}`, {
      status: "ACTIVE",
      isFeatured: true
    }, token);

    console.log(` - Received status code: ${failRes.status}`);
    console.log(` - Received body:`, failRes.body);

    if (failRes.status !== 400) {
      throw new Error(`Expected status 400 Bad Request, but got ${failRes.status}`);
    }

    const expectedMessage = "An organization can have at most 3 featured events. Please unfeature another event first.";
    if (failRes.body.message !== expectedMessage) {
      throw new Error(`Expected error message "${expectedMessage}", but got "${failRes.body.message}"`);
    }

    console.log("✅ 4th featured event was successfully blocked with the correct message!");

    // 6. Cleanup
    console.log("⏳ Deleting test events...");
    for (const id of createdEventIds) {
      const deleteRes = await request("DELETE", `/events/${id}`, null, token);
      if (deleteRes.status !== 200) {
        console.warn(`⚠️ Failed to delete event ${id}. Status: ${deleteRes.status}`);
      }
    }
    console.log("✅ Test events deleted.");

    // Restore original active featured events
    console.log("⏳ Restoring original active featured events...");
    for (const evt of activeFeatured) {
      await request("PATCH", `/events/${evt.id}`, { isFeatured: true }, token);
    }
    console.log("✅ Original state restored.");

    console.log("\n🏆 Featured Events Limit Validation E2E Test PASSED successfully!");

  } catch (error) {
    console.error("❌ E2E Validation failed:", error.message);
    // Attempt cleanup if possible
    if (token && createdEventIds.length > 0) {
      console.log("⏳ Performing emergency cleanup...");
      for (const id of createdEventIds) {
        await request("DELETE", `/events/${id}`, null, token);
      }
    }
    process.exit(1);
  }
}

runTests();
