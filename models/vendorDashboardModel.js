const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get revenue by stall ID
// test run: GET /api/stalls/1/revenue?period=monthly&date=2026-07-18
async function getRevenueByStallId(stallId, startDate, endDate) {
  let connection;
  try {
    // connects your Node.js application to Microsoft SQL Server
    connection = await sql.connect(dbConfig);
    // SQL query used to retive data
    const query = `SELECT
      COALESCE(SUM(TotalAmount), 0) AS Revenue
      FROM Orders
      WHERE StallID = @stallId
        AND OrderStatus = 'Completed'
        AND OrderDateTime >= @startDate
        AND OrderDateTime < @endDate`;

    // declaring parameters
    const request = connection.request();
    request.input("stallId", sql.Int, stallId);
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);

    // send quuery to the DB
    const result = await request.query(query);

    // return retrived data
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get book by ID
async function getBookById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id, title, author FROM Books WHERE id = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Book not found
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Create new book
async function createBook(bookData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "INSERT INTO Books (title, author) VALUES (@title, @author); SELECT SCOPE_IDENTITY() AS id;";
    const request = connection.request();
    request.input("title", bookData.title);
    request.input("author", bookData.author);
    const result = await request.query(query);

    const newBookId = result.recordset[0].id;
    return await getBookById(newBookId);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Update book
async function updateBook(id, bookData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const query = `
      UPDATE Books
      SET title = @title,
          author = @author
      WHERE id = @id
    `;

    const request = connection.request();
    request.input("id", id);
    request.input("title", bookData.title);
    request.input("author", bookData.author);

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    return await getBookById(id);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Delete book
async function deleteBook(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const query = "DELETE FROM Books WHERE id = @id";

    const request = connection.request();
    request.input("id", id);

    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};

// change:
// getAllBooks → getAllFoods
// Books → Foods
// id, title, author → id, name, category, available

// createBook → createFood
// bookData → foodData
// title → name
// author → category
// add available

// getBookById → getFoodById
// SELECT id, title, author FROM Books WHERE id = @id
// ↓
// SELECT id, name, category, available FROM Foods WHERE id = @id
