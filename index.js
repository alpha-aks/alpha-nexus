const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const port = 3030;
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const express = require("express");

// View engines & others
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine("html", ejs.renderFile);
app.set("trust proxy", true);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/website/views"));
app.use(express.static(path.join(__dirname, "/website/public")));

app.set("json spaces", 1);

// Routes

// Pages
app.get("/", (req, res) => {
  res.render("index");
});

// Send route
app.post("/form", async (req, res) => {
  try {
    const email = req.body.email;
    const phone = req.body.phone;

    const clientIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const modifiedipString = clientIP
      ? clientIP.split(",")[0].trim()
      : "Unknown";

    const clientAgent = req.headers["user-agent"] || req.socket.remoteAddress;

    webhookURL = process.env.WEBHOOK_URL;
    const message = {
      content: "New form submission",
      embeds: [
        {
          title: "Form Submission",
          fields: [
            {
              name: "Email",
              value: email,
            },
            {
              name: "Phone",
              value: phone,
            },
            {
              name: "Ip Address",
              value: modifiedipString,
            },
            {
              name: "Browser user agent",
              value: clientAgent,
            },
          ],
        },
      ],
    };

    await fetch(webhookURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    res.status(200).send("Form submitted successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send(`Internal Server Error: ${err}`);
  }
});

app.listen(port, () => {
  console.log("Server running on port - " + port);
});

process.on("unhandledRejection", (reason, p) => {
  console.log(" [antiCrash] :: Unhandled Rejection/Catch");
  console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
  console.log(" [antiCrash] :: Uncaught Exception/Catch");
  console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
  console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
  console.log(" [antiCrash] :: Multiple Resolves");
  console.log(type, promise, reason);
});
