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
  console.log("🚀 Starting Standalone Hub Customization E2E validation...");

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

    const token = loginRes.body.token;
    console.log("✅ Logged in successfully!");

    // 2. Fetch current customization settings
    console.log("⏳ Fetching current hub customization settings...");
    const fetchRes = await request("GET", "/organizations/customization", null, token);
    if (fetchRes.status !== 200) {
      throw new Error(`Failed to fetch customization. Status: ${fetchRes.status}`);
    }
    console.log("✅ Customization settings retrieved:", fetchRes.body);

    // 3. Update hub customization settings
    console.log("⏳ Patching customization settings...");
    const newSettings = {
      hubTitle: "NextGen Tech Academy Directory",
      hubDescription: "Welcome to NextGen portal. Discover our upcoming sessions below.",
      hubLogoUrl: "https://example.com/logo-new.png",
      hubIcon: "🚀",
      showCardDate: false,
      showCardLocation: true,
      showCardCapacity: false
    };

    const updateRes = await request("PATCH", "/organizations/customization", newSettings, token);
    if (updateRes.status !== 200) {
      throw new Error(`Failed to update customization. Status: ${updateRes.status}`);
    }
    console.log("✅ Customization settings updated successfully!");

    // 4. Retrieve public org events and verify settings are mapped
    console.log("⏳ Fetching public events directory to verify settings map...");
    const publicRes = await request("GET", "/organizations/hash2025/events");
    if (publicRes.status !== 200) {
      throw new Error(`Failed to fetch public events. Status: ${publicRes.status}`);
    }

    const org = publicRes.body.organization;
    console.log("✅ Public org settings verified:");
    console.log(` - Hub Title: "${org.hubTitle}" (Expected: "${newSettings.hubTitle}")`);
    console.log(` - Hub Icon: "${org.hubIcon}" (Expected: "${newSettings.hubIcon}")`);
    console.log(` - Show Card Date: ${org.showCardDate} (Expected: ${newSettings.showCardDate})`);
    console.log(` - Show Card Location: ${org.showCardLocation} (Expected: ${newSettings.showCardLocation})`);
    console.log(` - Show Card Capacity: ${org.showCardCapacity} (Expected: ${newSettings.showCardCapacity})`);

    if (
      org.hubTitle !== newSettings.hubTitle ||
      org.hubIcon !== newSettings.hubIcon ||
      org.showCardDate !== newSettings.showCardDate ||
      org.showCardLocation !== newSettings.showCardLocation ||
      org.showCardCapacity !== newSettings.showCardCapacity
    ) {
      throw new Error("Mismatched properties on public events response object!");
    }

    // 5. Cleanup / Restore settings
    console.log("⏳ Restoring original hub customization settings...");
    await request("PATCH", "/organizations/customization", {
      hubTitle: "Events Registry",
      hubDescription: "Welcome to our hub registry. Click on any active listing deck below to register for upcoming sessions and matches.",
      hubLogoUrl: null,
      hubIcon: "🏫",
      showCardDate: true,
      showCardLocation: true,
      showCardCapacity: true
    }, token);
    console.log("✅ Original settings restored successfully!");

    console.log("\n🏆 Standalone Hub Customization E2E validation PASSED with 100% SUCCESS!");
  } catch (error) {
    console.error("❌ E2E Customization validation failed:", error.message);
    process.exit(1);
  }
}

runTests();
