import "dotenv/config";
import express from "express";
import { neon } from "@neondatabase/serverless";

const app = express();

app.use(express.json());

const sql = neon(process.env.DATABASE_URL);

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Users Dashboard</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 0 16px;
      color: #222;
    }

    h1 {
      margin-bottom: 6px;
    }

    form {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 22px 0;
    }

    input,
    button {
      padding: 10px;
      font: inherit;
    }

    input {
      flex: 1;
      min-width: 150px;
    }

    button {
      cursor: pointer;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f5f5f5;
    }

    button:hover {
      background: #e8e8e8;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 16px;
    }

    th,
    td {
      text-align: left;
      border-bottom: 1px solid #ddd;
      padding: 11px 8px;
    }

    th {
      background: #f5f5f5;
    }

    .actions {
      display: flex;
      gap: 6px;
    }

    #message {
      min-height: 1.2em;
      color: #555;
    }

    #form-title {
      width: 100%;
      margin: 0 0 4px 0;
    }

    #cancel-button {
      display: none;
    }
  </style>
</head>

<body>

  <h1>Users</h1>

  <p>A tiny CRUD dashboard backed by Express and PostgreSQL.</p>

  <form id="user-form">

    <h3 id="form-title">Add a new user</h3>

    <input
      id="name"
      placeholder="Full name"
      required
      maxlength="100"
    >

    <input
      id="email"
      type="email"
      placeholder="Email"
      required
      maxlength="200"
    >

    <button id="submit-button" type="submit">
      Add user
    </button>

    <button id="cancel-button" type="button">
      Cancel
    </button>

  </form>

  <p id="message" role="status"></p>

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody id="users"></tbody>
  </table>


  <script>
    const body = document.querySelector("#users");
    const message = document.querySelector("#message");

    const form = document.querySelector("#user-form");
    const nameInput = document.querySelector("#name");
    const emailInput = document.querySelector("#email");

    const submitButton = document.querySelector("#submit-button");
    const cancelButton = document.querySelector("#cancel-button");
    const formTitle = document.querySelector("#form-title");

    let editingUserId = null;


    async function loadUsers() {
      message.textContent = "Loading users...";

      try {
        const response = await fetch("/api/users");
        const users = await response.json();

        if (!response.ok) {
          message.textContent =
            users.error || "Could not load users.";
          return;
        }

        body.replaceChildren();

        for (const user of users) {
          const row = document.createElement("tr");

          const idCell = document.createElement("td");
          idCell.textContent = user.id;
          row.appendChild(idCell);

          const nameCell = document.createElement("td");
          nameCell.textContent = user.full_name;
          row.appendChild(nameCell);

          const emailCell = document.createElement("td");
          emailCell.textContent = user.email;
          row.appendChild(emailCell);

          const actionsCell = document.createElement("td");
          actionsCell.className = "actions";

          const editButton = document.createElement("button");
          editButton.textContent = "Edit";

          editButton.addEventListener("click", () => {
            startEditing(user);
          });

          actionsCell.appendChild(editButton);

          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";

          deleteButton.addEventListener("click", () => {
            deleteUser(user.id);
          });

          actionsCell.appendChild(deleteButton);

          row.appendChild(actionsCell);
          body.appendChild(row);
        }

        if (users.length === 0) {
          message.textContent =
            "No users yet. Add one above.";
        } else {
          message.textContent = "";
        }

      } catch (error) {
        console.error(error);

        message.textContent =
          "Could not connect to the server.";
      }
    }


    function startEditing(user) {
      editingUserId = user.id;

      nameInput.value = user.full_name;
      emailInput.value = user.email;

      formTitle.textContent = "Edit user";
      submitButton.textContent = "Update user";
      cancelButton.style.display = "inline-block";

      nameInput.focus();

      message.textContent =
        "Editing user #" + user.id;
    }


    function cancelEditing() {
      editingUserId = null;

      form.reset();

      formTitle.textContent = "Add a new user";
      submitButton.textContent = "Add user";
      cancelButton.style.display = "none";

      message.textContent = "";
    }


    cancelButton.addEventListener("click", () => {
      cancelEditing();
    });


    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const full_name = nameInput.value.trim();
      const email = emailInput.value.trim();

      if (!full_name || !email || !email.includes("@")) {
        message.textContent =
          "Enter a name and a valid email.";
        return;
      }

      try {

        if (editingUserId === null) {

          message.textContent = "Saving...";

          const response = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              full_name,
              email
            })
          });

          const result = await response.json();

          if (!response.ok) {
            message.textContent =
              result.error || "Could not add user.";
            return;
          }

          form.reset();

          await loadUsers();

          message.textContent = "User added.";

        } else {

          message.textContent = "Updating...";

          const response = await fetch(
            "/api/users/" + editingUserId,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                full_name,
                email
              })
            }
          );

          const result = await response.json();

          if (!response.ok) {
            message.textContent =
              result.error || "Could not update user.";
            return;
          }

          cancelEditing();

          await loadUsers();

          message.textContent = "User updated.";
        }

      } catch (error) {
        console.error(error);

        message.textContent =
          "Could not connect to the server.";
      }
    });


    async function deleteUser(id) {

      const confirmed = confirm(
        "Are you sure you want to delete user #" + id + "?"
      );

      if (!confirmed) {
        return;
      }

      try {

        message.textContent = "Deleting...";

        const response = await fetch(
          "/api/users/" + id,
          {
            method: "DELETE"
          }
        );

        const result = await response.json();

        if (!response.ok) {
          message.textContent =
            result.error || "Could not delete user.";
          return;
        }

        if (editingUserId === id) {
          cancelEditing();
        }

        await loadUsers();

        message.textContent = "User deleted.";

      } catch (error) {
        console.error(error);

        message.textContent =
          "Could not connect to the server.";
      }
    }


    loadUsers();
  </script>

</body>
</html>`);
});


app.get("/api/users", async (_req, res) => {
  try {

    const users = await sql`
      SELECT id, full_name, email
      FROM users
      ORDER BY id ASC
    `;

    res.json(users);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error:
        "Database request failed. Check DATABASE_URL and create the users table."
    });
  }
});


app.post("/api/users", async (req, res) => {

  const full_name =
    typeof req.body.full_name === "string"
      ? req.body.full_name.trim()
      : "";

  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim()
      : "";

  if (!full_name || !email || !email.includes("@")) {
    return res.status(400).json({
      error: "Enter a name and a valid email."
    });
  }

  try {

    const [user] = await sql`
      INSERT INTO users (full_name, email)
      VALUES (${full_name}, ${email})
      RETURNING id, full_name, email
    `;

    res.status(201).json(user);

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({
        error: "That email is already in the users table."
      });
    }

    console.error(error);

    res.status(500).json({
      error:
        "Could not save user. Check the database connection."
    });
  }
});


app.put("/api/users/:id", async (req, res) => {

  const id = Number(req.params.id);

  const full_name =
    typeof req.body.full_name === "string"
      ? req.body.full_name.trim()
      : "";

  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim()
      : "";

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid user ID."
    });
  }

  if (!full_name || !email || !email.includes("@")) {
    return res.status(400).json({
      error: "Enter a name and a valid email."
    });
  }

  try {

    const [user] = await sql`
      UPDATE users
      SET
        full_name = ${full_name},
        email = ${email}
      WHERE id = ${id}
      RETURNING id, full_name, email
    `;

    if (!user) {
      return res.status(404).json({
        error: "User not found."
      });
    }

    res.json(user);

  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({
        error: "That email is already in the users table."
      });
    }

    console.error(error);

    res.status(500).json({
      error:
        "Could not update user. Check the database connection."
    });
  }
});


app.delete("/api/users/:id", async (req, res) => {

  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid user ID."
    });
  }

  try {

    const [deletedUser] = await sql`
      DELETE FROM users
      WHERE id = ${id}
      RETURNING id, full_name, email
    `;

    if (!deletedUser) {
      return res.status(404).json({
        error: "User not found."
      });
    }

    res.json({
      message: "User deleted successfully.",
      user: deletedUser
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error:
        "Could not delete user. Check the database connection."
    });
  }
});


if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Local server: http://localhost:${PORT}`);
  });
}

export default app;
