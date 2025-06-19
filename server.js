// server.js (Updated with correct table mappings based on your database)
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cv",
});

db.connect((err) => {
  if (err) console.error("DB connection failed:", err.message);
  else console.log("Connected to MySQL database!");
});

app.use((req, res, next) => {
  if (db.state === "disconnected")
    return res.status(503).json({ error: "Database not connected" });
  next();
});

app.get("/", (req, res) => res.send("API is running..."));

app.get("/api/referrals/is_eligible_for_referrals", (req, res) => {
  res.status(200).json({ eligible: true });
});

app.get("/api/userinfo", (req, res) => {
  db.query("SELECT * FROM userform_userinfo", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/info-cards", (req, res) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM userform_userinfo) AS total_users,
      (SELECT COUNT(*) FROM userform_userinfo WHERE time_stamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS weekly_users,
      (SELECT COUNT(*) FROM userform_userinfo WHERE time_stamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)) AS monthly_users
    FROM DUAL`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const r = results[0] || {};
    res.json([
      { title: "Total Users", value: r.total_users || 0, icon: "👥" },
      { title: "New This Week", value: r.weekly_users || 0, icon: "📅" },
      { title: "New This Month", value: r.monthly_users || 0, icon: "🗓️" },
    ]);
  });
});

app.get("/api/monthly-cv-count", (req, res) => {
  const query = `
    SELECT DATE_FORMAT(time_stamp, '%b') AS month, COUNT(*) AS count
    FROM userform_userinfo
    WHERE YEAR(time_stamp) = YEAR(CURDATE())
    GROUP BY MONTH(time_stamp)
    ORDER BY MONTH(time_stamp)`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      labels: results.map((r) => r.month),
      datasets: [
        {
          label: "User Registrations",
          data: results.map((r) => r.count),
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
      ],
    });
  });
});

app.get("/api/weekly-cv-count", (req, res) => {
  const query = `
    SELECT DATE(time_stamp) AS date, COUNT(*) AS count
    FROM userform_userinfo
    WHERE time_stamp >= CURDATE() - INTERVAL 6 DAY
    GROUP BY DATE(time_stamp)
    ORDER BY DATE(time_stamp)`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      labels: results.map((r) => r.date),
      datasets: [
        {
          label: "User Registrations",
          data: results.map((r) => r.count),
          backgroundColor: "rgba(16, 185, 129, 0.5)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
          fill: false,
          tension: 0.3,
        },
      ],
    });
  });
});

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  const hardcodedPassword = "mysecret123";

  if (!password)
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  if (password === hardcodedPassword)
    return res.status(200).json({ success: true });
  res.status(401).json({ success: false, message: "Invalid password" });
});
app.get("/api/cvs", (req, res) => {
  // const userId = req.params.id;
  const { month } = req.query;
  const params = [];

  const baseQuery = `
    SELECT 
      u.id,
      u.First_Name,
      u.Last_Name,
      CONCAT(u.First_Name, ' ', u.Last_Name) AS full_name,
      u.Ph_No,
      u.Email,
      u.Address,
     DATE_FORMAT(u.Dob, '%d-%m-%Y') AS Dob,
      u.photo,
      u.Highest_Education,
      u.Educational_Year,
      u.Expected_Salary,
      DATE_FORMAT(u.time_stamp, '%Y-%m-%d') AS date,
      d.Department AS department,
      des.Designation AS designation,
      s.Name AS status,
      
      GROUP_CONCAT(DISTINCT sk.Skill) AS skills,
      GROUP_CONCAT(DISTINCT sub.SubSkill) AS subskills,
      GROUP_CONCAT(DISTINCT lang.language) AS languages,
      GROUP_CONCAT(DISTINCT hob.Hobby) AS hobbies,
      GROUP_CONCAT(DISTINCT cert.certificate_name) AS certificates,
      GROUP_CONCAT(DISTINCT exp.Company_name) AS companies,
      GROUP_CONCAT(DISTINCT act.description) AS extra_activities,
      additional.additional_details AS additional_info

    FROM userform_userinfo u
    LEFT JOIN userform_department d ON u.Department_id = d.id
    LEFT JOIN userform_designation des ON u.Designation_id = des.id
    LEFT JOIN userform_status s ON u.Status_id = s.id
    LEFT JOIN userform_selectedskill selS ON u.id = selS.user_id
    LEFT JOIN userform_skill sk ON selS.Skill_id = sk.id
    LEFT JOIN userform_selectedsubskill selSS ON u.id = selSS.user_id
    LEFT JOIN userform_subskill sub ON selSS.SubSkill_id = sub.id
    LEFT JOIN userform_selectedlanguage selL ON u.id = selL.user_id
    LEFT JOIN userform_language lang ON selL.language_id = lang.id
    LEFT JOIN userform_selectedhobby selH ON u.id = selH.user_id
    LEFT JOIN userform_hobby hob ON selH.hobby_id = hob.id
    LEFT JOIN userform_certificate cert ON u.id = cert.user_id
    LEFT JOIN userform_workexperience exp ON u.id = exp.user_id
    LEFT JOIN userform_extraactivity act ON u.id = act.user_id
    LEFT JOIN userform_additionalinfo additional ON u.id = additional.user_id
    
  `;

  //  const workExpQuery = `
  //             SELECT
  //                 Company_name,
  //                 job_positions,
  //                 property_type,
  //                 DATE_FORMAT(Start_Date, '%Y-%m-%d') AS Start_Date,
  //                 DATE_FORMAT(End_Date, '%Y-%m-%d') AS End_Date,
  //                 CONCAT(
  //                     FLOOR(DATEDIFF(End_Date, Start_Date) / 365), ' years, ',
  //                     FLOOR(MOD(DATEDIFF(End_Date, Start_Date), 365) / 30), ' months'
  //                 ) AS Experience
  //             FROM userform_workexperience
  //             WHERE user_id = ?
  //             ORDER BY Start_Date DESC;
  //         `;
  //     // const [workExperience] = await db.promise().query(workExpQuery, [userId]);
  //     cv.work_experience = workExperience;

  let sql = baseQuery.trim(); // Trim to ensure clean append

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    sql += ` WHERE DATE_FORMAT(u.time_stamp, '%Y-%m') = ?`;
    params.push(month);
  }

  sql += ` GROUP BY u.id`;

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/cvs/:id/workexperience", (req, res) => {
  const userId = req.params.id;

  const workExpQuery = `
   SELECT
  Company_name,
  job_positions,
  property_type,
  DATE_FORMAT(Start_Date, '%m-%Y') AS Start_Date,
  DATE_FORMAT(End_Date, '%m-%Y') AS End_Date,
  CASE
    WHEN FLOOR(DATEDIFF(End_Date, Start_Date) / 365) = 0 THEN
      CONCAT(FLOOR(MOD(DATEDIFF(End_Date, Start_Date), 365) / 30), ' months')
    WHEN FLOOR(MOD(DATEDIFF(End_Date, Start_Date), 365) / 30) = 0 THEN
      CONCAT(FLOOR(DATEDIFF(End_Date, Start_Date) / 365), ' years')
    ELSE
      CONCAT(
        FLOOR(DATEDIFF(End_Date, Start_Date) / 365), ' years, ',
        FLOOR(MOD(DATEDIFF(End_Date, Start_Date), 365) / 30), ' months'
      )
  END AS Experience
FROM userform_workexperience
WHERE user_id = ?
ORDER BY Start_Date DESC;
  `;

  db.query(workExpQuery, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put("/api/cvs/:id", (req, res) => {
  const { id } = req.params;
  const { Status_id } = req.body;

  if (!Status_id)
    return res.status(400).json({ error: "Status_id is required" });

  db.query(
    "UPDATE userform_userinfo SET Status_id = ? WHERE user_id = ?",
    [Status_id, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "CV not found" });
      res.json({ success: true });
    }
  );
});

app.delete("/api/cvs/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "DELETE FROM userform_userinfo WHERE user_id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "CV not found" });
      res.json({ message: "CV deleted successfully" });
    }
  );
});

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
// const express = require("express");
// const mysql = require("mysql2");
// const cors = require("cors");
// const app = express();
// const PORT = 3000; // Adjust as needed

app.use(cors());
app.use(express.json());

// MySQL connection
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "cv",
// });

// ✅ Get CVs by Status
app.post("/api/status-cvs", (req, res) => {
  const { Status_id } = req.body;

  if (!Status_id) {
    return res.status(400).json({ error: "Status is required" });
  }

  const query = `
    SELECT 
      u.user_id AS _id,
      u.First_Name,
      u.Last_Name,
      CONCAT(u.First_Name, ' ', u.Last_Name) AS full_name,
      u.Ph_No,
      u.Address,
      d.Department AS department,
      des.Designation AS designation,
      u.Status_id,
      u.Expected_Salary,
      DATE_FORMAT(u.time_stamp, '%Y-%m-%d') AS date
    FROM userform_userinfo u
    LEFT JOIN userform_department d ON u.Department_id = d.id
    LEFT JOIN userform_designation des ON u.Designation_id = des.id
    WHERE u.Status_id = ?
    ORDER BY u.user_id DESC
  `;

  db.query(query, [Status_id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching CVs by status:", err);
      return res
        .status(500)
        .json({ error: "Database error", details: err.message });
    }
    res.status(200).json(result || []);
  });
});

// ✅ Search by Single Filter
// Assume 'db' is your MySQL/MariaDB connection pool or connection object.
// You'll need to have 'express' and 'cors' installed and configured as well.

// Example setup (not part of the functions below, but for context):
/*
const express = require('express');
const mysql = require('mysql2'); // Or 'mysql' or 'sequelize'
const cors = require('cors');

const app = express();
const port = 5000;

// Database connection setup
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'your_db_user',
    password: 'your_db_password',
    database: 'cv',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies
*/

// ✅ Search by Specific Filters
app.post("/api/search-cvs", (req, res) => {
  const { phone, designation, type, salary, status } = req.body;

  const filters = { phone, designation, type, salary, status };
  const activeKeys = Object.keys(filters).filter((k) => filters[k]);

  if (activeKeys.length !== 1) {
    return res
      .status(400)
      .json({ error: "Please provide exactly one search filter." });
  }

  const key = activeKeys[0];
  let col,
    value = filters[key];

  switch (key) {
    case "phone":
      col = "u.Ph_No";
      break;
    case "designation":
      col = "des.Designation";
      break;
    case "type": // 'type' maps to Department
      col = "d.Department";
      break;
    case "salary":
      col = "u.Expected_Salary";
      value = parseFloat(value);
      break;
    case "status":
      col = "s.Name";
      break;
    default:
      return res.status(400).json({ error: "Invalid filter." });
  }

  const sql = `
    SELECT
      u.id AS _id, -- Changed to u.id for consistency with update endpoint
      u.First_Name,
      u.Last_Name,
      CONCAT(u.First_Name, ' ', u.Last_Name) AS full_name,
      u.Ph_No,
      u.Email,
      u.Address,
      u.Dob, -- Corrected column name to Dob
      u.Expected_Salary,
      DATE_FORMAT(u.time_stamp, '%Y-%m-%d') AS date,
      d.Department AS department,
      des.Designation AS designation,
      s.Name AS status, -- Aliased as 'status'
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(u.Address, ',', -2), ',', 1)) AS city,
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(u.Address, ',', -1), '-', 1)) AS state
    FROM userform_userinfo u
    LEFT JOIN userform_department d ON u.Department_id = d.id
    LEFT JOIN userform_designation des ON u.Designation_id = des.id
    LEFT JOIN userform_status s ON u.Status_id = s.id
    WHERE ${col} = ?
    ORDER BY u.time_stamp DESC
  `;

  db.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Search error for specific filter:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    // Frontend expects full_name, department, designation, status, city, state directly
    // Address parsing is done in SQL.
    res.json(results);
  });
});

// ✅ Update Status by ID
app.put("/api/update-status/:id", (req, res) => {
  const { id } = req.params; // This 'id' refers to userform_userinfo.id (the primary key)
  const { status } = req.body; // New status name (e.g., "Hired", "Shortlisted")

  if (!status) {
    return res.status(400).json({ error: "Status name is required." });
  }

  // First, find the Status_id from the status name
  const sqlFind = `SELECT id FROM userform_status WHERE Name = ?`;
  db.query(sqlFind, [status], (err, rows) => {
    if (err) {
      console.error("Error finding status ID:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid status name provided." });
    }

    const statusId = rows[0].id; // Get the numeric ID for the status

    // Update the user's status_id in the userform_userinfo table
    // Using 'id' as the WHERE clause, which is the primary key of userform_userinfo
    const sqlUpd = `UPDATE userform_userinfo SET Status_id = ? WHERE id = ?`;
    db.query(sqlUpd, [statusId, id], (err2, result) => {
      if (err2) {
        console.error("Error updating status in user info:", err2);
        return res.status(500).json({ error: "Failed to update CV status." });
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "CV not found or status already updated." });
      }
      res.json({ success: true, message: "Status updated successfully." });
    });
  });
});

// ✅ Get Status Options
app.get("/api/status-options", (req, res) => {
  const sql = "SELECT id, Name FROM userform_status ORDER BY Name ASC"; // Added ordering for display
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching status list:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});

// ✅ Search by Free Text / Keyword (Common Search)
app.post("/api/search-similar", (req, res) => {
  const { keyword } = req.body;

  if (!keyword || keyword.trim() === "") {
    return res
      .status(400)
      .json({ error: "Keyword is required for common search." });
  }

  const likeKeyword = `%${keyword.trim()}%`;

  const query = `
    SELECT
      UI.id AS _id, -- Changed to UI.id to match primary key, consistent with update
      UI.First_Name,
      UI.Last_Name,
      CONCAT(UI.First_Name, ' ', UI.Last_Name) AS full_name,
      UI.Ph_No,
      UI.Email,
      UI.photo,
      D.Department AS department,
      DS.Designation AS designation,
      S.Name AS status, -- Aliased as 'status'
      UI.Expected_Salary,
      DATE_FORMAT(UI.time_stamp, '%Y-%m-%d') AS date, -- Added date for consistency, though not used in frontend table
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(UI.Address, ',', -2), ',', 1)) AS city,
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(UI.Address, ',', -1), '-', 1)) AS state
    FROM userform_userinfo UI
    LEFT JOIN userform_department D ON UI.Department_id = D.id
    LEFT JOIN userform_designation DS ON UI.Designation_id = DS.id
    LEFT JOIN userform_status S ON UI.Status_id = S.id
    WHERE
      UI.First_Name LIKE ? OR
      UI.Last_Name LIKE ? OR
      UI.Ph_No LIKE ? OR
      UI.Email LIKE ? OR
      DS.Designation LIKE ? OR
      D.Department LIKE ? OR
      S.Name LIKE ? OR
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(UI.Address, ',', -2), ',', 1)) LIKE ? OR
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(UI.Address, ',', -1), '-', 1)) LIKE ?
    ORDER BY UI.id DESC -- Changed to UI.id for ordering
  `;

  // Prepare the parameters array for the query
  const queryParams = Array(9).fill(likeKeyword);

  db.query(
    query,
    queryParams, // Pass the array of parameters
    (err, results) => {
      if (err) {
        console.error("❌ Database error during common search:", err.message);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    }
  );
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
app.post("/api/status1-cvs", (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  const sql = `
    SELECT 
      u.user_id AS _id,
      u.First_Name,
      u.Last_Name,
      u.Ph_No,
      d.Department AS department,
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(u.Address, ',', -2), ',', 1)) AS city,
      TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(u.Address, ',', -1), '-', 1)) AS state,
      u.Expected_Salary,
      u.Experience,
      s.Name ,
      DATE_FORMAT(u.time_stamp, '%Y-%m-%d') AS date
    FROM userform_userinfo u
    LEFT JOIN userform_department d ON u.Department_id = d.id
    LEFT JOIN userform_status s ON u.Status_id = s.id
    WHERE s.Name = ?
    ORDER BY u.time_stamp DESC
  `;

  db.query(sql, [status], (err, results) => {
    if (err) {
      console.error("❌ Error fetching CVs:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});
// -------------------------------------------------------------------
// ✅ API endpoint to fetch all details for a single CV (GET /api/cv-details/:id)
// This is used by CVLastMonth for the modal.
// -------------------------------------------------------------------
// app.get("/api/cv-details/:id", async (req, res) => {
//   const userId = req.params.id; // Get the user ID from the URL parameter (this is userform_userinfo.id)

//   try {
//     // 1. Fetch main user info and directly join for Department, Designation, Status Names
//     const mainInfoQuery = `
//             SELECT
//                 ui.id AS _id,
//                 ui.First_Name,
//                 ui.Last_Name,
//                 CONCAT(ui.First_Name, ' ', ui.Last_Name) AS full_name,
//                 ui.Ph_No,
//                 ui.Email,
//                 ui.photo, -- Column name is 'photo' in userform_userinfo
//                 ui.Address,
//                 DATE_FORMAT(ui.Dob') AS Dob, -- Format Date of Birth
//                 ui.Expected_Salary,
//                 ui.Highest_Education,
//                 ui.Educational_Year,
//                 ui.objective,
//                 d.Department AS department,      -- Get Department Name
//                 des.Designation AS designation,  -- Get Designation Name
//                 s.Name AS status                 -- Get Status Name
//             FROM userform_userinfo ui
//             LEFT JOIN userform_department d ON ui.Department_id = d.id
//             LEFT JOIN userform_designation des ON ui.Designation_id = des.id
//             LEFT JOIN userform_status s ON ui.Status_id = s.id
//             WHERE ui.id = ?;
//         `;
//     const [mainInfoRows] = await db.promise().query(mainInfoQuery, [userId]);

//     if (mainInfoRows.length === 0) {
//       return res.status(404).json({ error: "CV not found." });
//     }

//     const cv = mainInfoRows[0]; // The main CV object to build upon

//     // 2. Fetch work experience (uses userform_workexperience.user_id which links to userform_userinfo.id)
//     const workExpQuery = `
//             SELECT
//                 Company_name,
//                 job_positions,
//                 property_type,
//                 DATE_FORMAT(Start_Date, '%Y-%m-%d') AS Start_Date,
//                 DATE_FORMAT(End_Date, '%Y-%m-%d') AS End_Date,
//                 CONCAT(
//                     FLOOR(DATEDIFF(End_Date, Start_Date) / 365), ' years, ',
//                     FLOOR(MOD(DATEDIFF(End_Date, Start_Date), 365) / 30), ' months'
//                 ) AS Experience
//             FROM userform_workexperience
//             WHERE user_id = ?
//             ORDER BY Start_Date DESC;
//         `;
//     const [workExperience] = await db.promise().query(workExpQuery, [userId]);
//     cv.work_experience = workExperience;

//     // 3. Fetch skills (Corrected table name to userform_selectedskill as per SQL dump)
//     const skillsQuery = `
//             SELECT s.Skill FROM userform_selectedskill us
//             JOIN userform_skill s ON us.Skill_id = s.id
//             WHERE us.user_id = ?;
//         `;
//     const [selected_skills] = await db.promise().query(skillsQuery, [userId]);
//     cv.selected_skills = selected_skills;

//     // 4. Fetch subskills (Corrected table name to userform_selectedsubskill as per SQL dump)
//     const subSkillsQuery = `
//             SELECT ss.SubSkill FROM userform_selectedsubskill uss
//             JOIN userform_subskill ss ON uss.SubSkill_id = ss.id
//             WHERE uss.user_id = ?;
//         `;
//     const [selected_subskills] = await db
//       .promise()
//       .query(subSkillsQuery, [userId]);
//     cv.selected_subskills = selected_subskills;

//     // 5. Fetch certificates (Table name userform_certificate is correct)
//     const certificatesQuery = `
//             SELECT certificate_name FROM userform_certificate WHERE user_id = ?;
//         `;
//     const [certificates] = await db
//       .promise()
//       .query(certificatesQuery, [userId]);
//     cv.certificates = certificates;

//     // 6. Fetch languages (Corrected table name to userform_selectedlanguage as per SQL dump)
//     const languagesQuery = `
//             SELECT l.language FROM userform_selectedlanguage usl
//             JOIN userform_language l ON usl.language_id = l.id
//             WHERE usl.user_id = ?;
//         `;
//     const [selected_languages] = await db
//       .promise()
//       .query(languagesQuery, [userId]);
//     cv.selected_languages = selected_languages;

//     // 7. Fetch hobbies (Corrected table name to userform_selectedhobby as per SQL dump)
//     const hobbiesQuery = `
//             SELECT h.Hobby FROM userform_selectedhobby ush
//             JOIN userform_hobby h ON ush.hobby_id = h.id
//             WHERE ush.user_id = ?;
//         `;
//     const [selected_hobbies] = await db.promise().query(hobbiesQuery, [userId]);
//     cv.selected_hobbies = selected_hobbies;

//     // 8. Fetch extra activities (Corrected table name to userform_extraactivity as per SQL dump)
//     const extraActivitiesQuery = `
//             SELECT description FROM userform_extraactivity WHERE user_id = ?;
//         `;
//     const [extra_activities_rows] = await db
//       .promise()
//       .query(extraActivitiesQuery, [userId]);
//     cv.extra_activities =
//       extra_activities_rows.length > 0 ? extra_activities_rows[0] : null;

//     // 9. Fetch additional info (Table name userform_additionalinfo is correct)
//     const additionalInfoQuery = `
//             SELECT additional_details FROM userform_additionalinfo WHERE user_id = ?;
//         `;
//     const [additional_info_rows] = await db
//       .promise()
//       .query(additionalInfoQuery, [userId]);
//     cv.additional_info =
//       additional_info_rows.length > 0 ? additional_info_rows[0] : null;

//     res.json(cv); // Send the complete, structured CV object as JSON
//   } catch (error) {
//     console.error("Error fetching CV details:", error);
//     res
//       .status(500)
//       .json({ error: "Internal Server Error fetching CV details." });
//   }
// });
